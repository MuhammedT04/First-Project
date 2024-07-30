const Offer=require('../model/offer')
const Product=require('../model/product')
const Category=require('../model/category')


const offerList=async(req,res)=>{
    try {
        const offer=await Offer.find({offer:{$gt:0}})
        
        res.render('admin/OfferList',{offer})
    } catch (error) {
        console.log(error.message)
    }
}


const AddOffer=async (req,res)=>{
    try {
        const msg=req.flash('msg')
        res.render('admin/AddOffer',{msg})
    } catch (error) {
        console.log(error.message)
    }
}




const addOfferData=async(req,res)=>{
    try {
        const {name,offer}=req.body
        const offers=await Offer.findOne({offer:offer})
        if(!offers){

            const OfferData=new Offer({
                name,
                offer
            })
           const saveOffer= await OfferData.save()
           if(saveOffer){
            res.redirect("/admin/offerList")
           }else{
            res.redirect('/admin/addOffer')
           }
        }else{
            req.flash('msg','Offer already exists')
            res.redirect('/admin/addOffer')
        }
    } catch (error) {
        console.log(error.message)
    }
}



const EditOffer=async(req,res)=>{
    try {
        const EditOffers=await Offer.findOne({_id:req.params.id})
        res.render('admin/EditOffer',{EditOffers})
    } catch (error) {
        console.log(error.message)
    }
}



const EditUpdateData=async(req,res)=>{
    try {
        const {name,offer,ID,OfferData}=req.body
        const OfferDatas=await Offer.findOne({offer})

      if(!OfferDatas){

        await Offer.findOneAndUpdate({_id:ID},{$set:{name,offer}})
        
        const categoryoffer=await Category.find({offer:OfferData})
        for(const category of categoryoffer){
            await Category.updateOne({_id:category._id},{$set:{offer}})
        }

        const productOffer=await Product.find({offer:OfferData})

            for(const products of productOffer){
                const originalPrice = products.price
                const newPrice = Math.round(originalPrice / 100 * (100 - offer))

                await Product.updateOne({ _id: products._id },{$set:{offer: offer,offerPrire: newPrice}})
            }
            res.redirect('/admin/offerList')
      }else{
        req.flash('msg','Offer already exists')
        const Offers=await Offer.findOne({offer:OfferData})
        const msg=req.flash('msg')
        res.render('admin/EditOffer',{EditOffers:Offers,msg})
      }
        
        
        
    } catch (error) {
        console.log(error.message)
    }
}


// Single Product Offer


const singleProduct=async(req,res)=>{
    try {
        const {ProductID,Offer}=req.body
        const SingleProcduct=await Product.findOne({_id:ProductID})
        let OfferPrice=Math.round(SingleProcduct.price/ 100 * (100 - Offer))
        await Product.findOneAndUpdate({_id:ProductID},{$set:{offer:Offer,offerPrire:OfferPrice}})
        res.send({OfferPrice})
    } catch (error) {
        console.log(error.message)
    }
}



const categoryOffer=async(req,res)=>{
    try {
        const {categoryID,Offer}=req.body
        const products = await Product.find({ category: categoryID });


for (const product of products) {
  console.log(product)
    const originalPrice = product.price
    const newPrice = Math.round(originalPrice / 100 * (100 - Offer))
    await Category.findOneAndUpdate({_id:categoryID},{$set:{offer:Offer}})
     await Product.updateOne({ _id: product._id },{$set:{offer: Offer,offerPrire: newPrice}})

}
    } catch (error) {
        console.log(error.message)
    }
}

// Offer Delete


const deleteOffer=async(req,res)=>{
    try {
        const {ID}=req.body
        const offer= await Offer.findOne({_id:ID})

        const categoryoffer=await Category.find({offer:offer.offer})
        for(const category of categoryoffer){
            await Category.updateOne({_id:category._id},{$set:{offer:0}})
        }

        const productOffer=await Product.find({offer:offer.offer})

        for(const products of productOffer){
            await Product.updateOne({ _id: products._id },{$set:{offer: 0,offerPrire: products.price}})
        }

        await Offer.deleteOne({_id:ID})
        res.redirect('/admin/offerList')
    } catch (error) {
        console.log(error)
    }
}


module.exports={
    offerList,
    AddOffer,
    addOfferData,
    singleProduct,
    categoryOffer,
    EditOffer,
    EditUpdateData,
    deleteOffer
}