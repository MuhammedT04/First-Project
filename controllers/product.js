const productData=require('../model/product')
const session=require('express-session')
const category=require('../model/category')
 //products list

 const product=async(req,res)=>{
    try {
        const Datas=await productData.find().populate('category').exec()
        res.render('Admin/products',{Data:Datas})
    } catch (error) {
        console.log(error.message)
    }
 }

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
        const price=req.body.price
        const offerPrice=Math.round(price/100*(100-req.body.offer))

       const images=req.files.map(file=>file.filename)
        const productdatas= new productData({
            name:req.body.name,
            category:req.body.category,
            price:req.body.price,
            quantity:req.body.quantity,
            date:req.body.date,
            image:images,
            description:req.body.description,
            offerPrice:offerPrice,
            offer:req.body.offer
        })
        console.log(productdatas.offerPrice)
        const datastorig=await productdatas.save()
        if(datastorig){
            res.redirect('/admin/AddProduct')
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
        const {name,category,quantity,price,description,date,offer}=req.body;
        const offerPrice=Math.round(price/100*(100-offer))
        const images=req.files.map(file=>file.filename)
        let old=await productData.findOne({_id:req.body.id});
        let image=[]
        console.log(images,req.body.kk);
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


     
        const updated=await productData.findOneAndUpdate({_id:req.body.id},{$set:{name,category,quantity,price,description,date,image,offerPrice,offer}},{new:true})

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
        BlockData.status=!BlockData.status
        BlockData.save()
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

module.exports={
    product,
    addproduct,
    AddProductdata,
    productEdit,
    ProductBlock,
    ProductDelete,
    EditProductData,
    
}