const cart=require('../model/cart')
const product = require('../model/product')
const address=require('../model/address')



//-------------------------------------------------------------------------CART PAGE--------------------------------------------------------------------------------------------------------\\

const Cart=async(req,res)=>{
    try {
        const {user_id}=req.session
       const productCartData=await cart.findOne({clientId:user_id}).populate('products.productId')
       const totalPrice = productCartData.products.reduce((acc, val) => acc + val.totalPrice, 0)
       const offertotalPrice = productCartData.products.reduce((acc, val) => acc + val.totalOfferPrice, 0)
       await cart.findOneAndUpdate({clientId:user_id},{$set:{total:totalPrice,offerTotal:offertotalPrice}})
        res.render('User/cart',{Data:productCartData,user_id})
    } catch (error) {
        console.log(error.message)
    }
}



const cartData=async(req,res)=>{
    try {
        const Id = req.body.id;
        const productData=await product.findOne({_id:Id})
        const result = await cart.findOne({
            clientId: req.session.user_id,
            products: {
                $elemMatch: {
                    productId: req.body.id
                }
            }
        })
        if(!result){
            const total= productData.price*req.body.quantity
            const totalOfferPrice=productData.offerPrice*req.body.quantity
            const carg= await cart.findOneAndUpdate({clientId:req.session.user_id},{$addToSet:{ products:{productId:Id,quantity:req.body.quantity,totalPrice:total,totalOfferPrice:totalOfferPrice}}},{new:true,upsert:true})
            res.send({carg})
        }else{
         
            res.send({set:'aleredy there'})
        }
    } catch (error) {
        console.error(error.message);
    }
    
}



// Cart Quantity Update

const quantityUpdate=async(req,res)=>{
    try {
        const {id,val}=req.body
        const prod=await product.findOne({_id:id})
        const total= val*prod.price
        const offer=val*prod.offerPrice
        await cart.findOneAndUpdate({clientId: req.session.user_id,'products.productId':id},{$set:{'products.$.quantity':val,'products.$.totalPrice':total,'products.$.totalOfferPrice':offer}},{new:true})
        res.status(200).send({success:true})
    } catch (error) {
        console.log(error.message)
    }
}



// Cart product delete

const cartremove=async(req,res)=>{
    try {
        const {id}=req.body
       const remove=await cart.findOneAndUpdate({clientId:req.session.user_id},{$pull:{products:{productId:id}}},{new:true})
        res.redirect('/cart')
    } catch (error) {
        console.log(error.message)
    }
}






//--------------------------------------------------------------------------------------CHECK OUT----------------------------------------------------------------------------------------\\

const checkOut=async(req,res)=>{
    try {
        const {user_id}=req.session
        const msg=req.flash('msg')
        const add= await address.findOne({UserId:req.session.user_id})
        const addres= await address.findOne({UserId:user_id})
        const carts=await cart.findOne({clientId:req.session.user_id}).populate('products.productId')
        res.render('User/checkOut',{msg,addres,add,carts})
    } catch (error) {
        console.log(error.message)
    }
}


// Add Address 

const addressData=async(req,res)=>{
    try {
        const {user_id}=req.session
        const {name,phone,pincode,state,city,place,locality}=req.body

        const firstData=await address.findOne({
            UserId:user_id,
            address: {
                $elemMatch: {
                    locality:locality
                }
            }
        })
        if(!firstData){
            const newAddAddress= await address.findOneAndUpdate({UserId:user_id},{$addToSet:{ address:{name:name,phone:phone,pincode:pincode,state:state,city:city,place:place,locality:locality,status:true}}},{new:true,upsert:true})
            req.flash('msg','Successfully')
            res.redirect('/checkout')
        }else{
            req.flash('msg','locality already exists')
            res.redirect('/checkout')
        }
    } catch (error) {
        console.log(error.message)
    }
}


//change Address

const changeAdress=async(req,res)=>{
    try {
        const data = await address.bulkWrite([
            {
                updateOne: {
                    filter: { UserId: req.session.user_id, 'address.status': true },
                    update: { $set: { 'address.$.status': false } }
                }
            },
            {
                updateOne: {
                    filter: { UserId: req.session.user_id, 'address._id': req.body.n },
                    update: { $set: { 'address.$.status': true } }
                }
            }
        ]);
        
        // const newOne = await address.findOne({ UserId: req.session.user_id, 'address._id': req.body.n }, { 'address.$': 1 });
        // res.send({ newOne });
    } catch (error) {
        res.status(400).json({err:error})
    }
}







module.exports={
    Cart,
    checkOut,
    cartData,
    addressData,
    quantityUpdate,
    cartremove,
    changeAdress
}