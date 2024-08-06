const productData=require('../model/product')
const session=require('express-session')
const category=require('../model/category')
const Offer=require('../model/offer')
const moment = require('moment');
const currentDate = moment();
const Order=require('../model/order')
const Banner =require('../model/banner')

 //products list

 const product = async (req, res) => {
    try {
        const limit = 8;
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * limit;

        const totalProductCount = await productData.countDocuments();
        const totalPages = Math.ceil(totalProductCount / limit);

        const shopProducts = await productData.find().populate('category').skip(skip).limit(limit).exec();
        const offer=await Offer.find()
       
        res.render('Admin/products', { currentPage: page, totalPages, shopProducts, offer });
    } catch (error) {
        console.log(error.message);
    }
};


//Add product   image upload 

const addproduct=async(req,res)=>{
    try {
        const catedata=await category.find({status:true})
        res.render('Admin/AddProduct',{Datas:catedata})
    } catch (error) {
        console.log(error.message);
    }
}


const AddProductdata=async(req,res)=>{
    try {

       const images=req.files.map(file=>file.filename)
        const productdatas= new productData({
            name:req.body.name,
            category:req.body.category,
            price:req.body.price,
            quantity:req.body.quantity,
            date:Date(),
            image:images,
            description:req.body.description,
            offerPrire:req.body.price
        })
        const datastorig=await productdatas.save()
        if(datastorig){
            res.redirect('/admin/product')
        }else{
            res.redirect("/admin/home")
        }
    } catch (error) {
        console.log(error.message)
    }
}

// Product edit

const productEdit=async(req,res)=>{
    try {
        const catedata=await category.find()
        const Id=req.query.id
        const productvalue=await productData.findOne({_id:Id})
        if(productvalue){
            res.render('Admin/EditProduct',{Data:productvalue,cate:catedata})
        }
    } catch (error) {
        console.log(error.message)
    }
}

const EditProductData=async(req,res)=>{
    try {
        const {name,category,quantity,price,description,Offer}=req.body;
        const newOfferPrice = Math.round(price / 100 * (100 - Offer))
        const date=Date()
        const images=req.files.map(file=>file.filename)
        let old=await productData.findOne({_id:req.body.id});
        let image=[]
        for(let i=0;i<4;i++){
            if(old.image[i]!==req.body.kk[i]){
                images.forEach(e=>{
                    if(e.split('-')[1]==req.body.kk[i].split('-')[1]){
                        image[i]=e 
                    }
                })
            }else{
                image[i]=old.image[i]
            }
        }

        const updated=await productData.findOneAndUpdate({_id:req.body.id},{$set:{name,category,quantity,price,description,date,image,offerPrire:newOfferPrice}},{new:true})

        res.redirect('/admin/product')
    } catch (error) {
        console.log(error.message)
    }
}


//Product Block 

const ProductBlock=async(req,res)=>{
    try {
        const {id}=req.body
        const BlockData=await productData.findOne({_id:id})
        const orderProductCheck = await Order.findOne({
            "products.ProductStatus": "Ordered",
            products:{

                $elemMatch: {
                    productId: id
                }
            }
          
        });
        console.log(orderProductCheck,'orderProductCheck')
        if(!orderProductCheck){
            console.log('hjdfhjfhfhfhfhfhf');
            BlockData.status=!BlockData.status
            BlockData.save()
        }
    } catch (error) {
        console.log(error.message)  
    }
}


// Product Delete

const ProductDelete=async(req,res)=>{
    try {
        const Id=req.query.id
        const deleteData=await productData.deleteOne({_id:Id})
        res.redirect('/admin/product')
    } catch (error) {
        console.log(error.message)
    }
}






//Banner ////////////-------------------------------------////////////////////////////////


const banner=async(req,res)=>{
    try {
        const bannerlist=await Banner.find({})
        
        res.render('Admin/Banner',{bannerlist})
    } catch (error) {
        console.log(error.message)
    }
}


//Edit Banner

const EditBanner=async(req,res)=>{
    try {
        const ID=req.query.id
        const Data=await Banner.findOne({_id:ID})
        res.render('Admin/EditBanner',{Data})
    } catch (error) {
        console.log(error.message)
    }
}


const dataUpdate=async(req,res)=>{
    try {
        const {name,description,id}=req.body
        const image=req.file?.filename
        await Banner.findOneAndUpdate({_id:id},{$set:{name:name,description:description,image:image}})
        res.redirect("/admin/banner")
    } catch (error) {
        console.log(error.message)
    }
}



module.exports={
    product,
    addproduct,
    AddProductdata,
    productEdit,
    ProductBlock,
    ProductDelete,
    EditProductData,
    
    //banner

    banner,
    EditBanner,
    dataUpdate
}