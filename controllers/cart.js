const cart=require('../model/cart')
const product = require('../model/product')
const address=require('../model/address')
const coupon=require('../model/Coupon')
const session=require('express-session')
const User=require('../model/user')
const Wallet=require('../model/wallet')
//-------------------------------------------------------------------------CART PAGE--------------------------------------------------------------------------------------------------------\\

const Cart=async(req,res)=>{
    try {
        const {user_id}=req.session
       const productCartData=await cart.findOne({clientId:user_id}).populate('products.productId')
    
        res.render('User/cart',{Data:productCartData,user_id})
    
    } catch (error) {
        console.log(error.message)
    }
}



const cartData=async(req,res)=>{
    try {
        const Id = req.body.id;
        const result = await cart.findOne({
            clientId: req.session.user_id,
            products: {
                $elemMatch: {
                    productId: req.body.id
                }
            }
        })
        if(!result){
            const carg= await cart.findOneAndUpdate({clientId:req.session.user_id},{$addToSet:{ products:{productId:Id,quantity:req.body.quantity}}},{new:true,upsert:true})
            res.send({succ : true})
        }else{
         
            res.send({fail:true})
        }
    } catch (error) {
        console.error(error.message);
    }
    
}



// Cart Quantity Update

const quantityUpdate=async(req,res)=>{
    try {
        const {id,val}=req.body
       const updatacart= await cart.findOneAndUpdate({clientId: req.session.user_id,'products.productId':id},{$set:{'products.$.quantity':val}},{new:true})
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


const counts=async(req,res)=>{
    try {
        if (req.session.user_id) {
            
            const userIdd = req.session.user_id;

            const cartAcction = await cart.findOne({ clientId: userIdd });

            const val = cartAcction.products.length;

            res.send({ success: val });

        } else {

            res.send({success : 0})

        }
    } catch (error) {
        console.log(error.message)
    }
}




//--------------------------------------------------------------------------------------CHECK OUT----------------------------------------------------------------------------------------\\








//Apply Coupon

const ApplyCoupon=async(req,res)=>{
    try {
        const findCouponCode = await User.findOne({
            _id: req.session.user_id,
            'coupons.code':req.body.code,
        },{'coupons.$':1}).populate('coupons.couponId')
        let offers
        let min
        let max
        if(findCouponCode.coupons[0].couponStatus==='Claimed'||findCouponCode.coupons[0].couponStatus==="Expired"){

            const cartDatas=await cart.findOne({clientId:req.session.user_id}).populate('products.productId')
            let qutytotal=0
            let cartTotal=0
            cartDatas.products.forEach((Data)=>{
                qutytotal=Data.productId.offerPrire*Data.quantity
                cartTotal=cartTotal+qutytotal
            })

            res.send({msg:'Coupon Time exceed',total:cartTotal,dis:0})
       }else{
 
            findCouponCode.coupons.forEach((of)=>{
               offers=of.couponId.offer
               min=of.couponId.min
               max=of.couponId.max
            })
        req.session.coupon=offers
        req.session.code=req.body.code
        const cartDatas=await cart.findOne({clientId:req.session.user_id}).populate('products.productId')
        let qutytotal=0
        let cartTotal=0
        cartDatas.products.forEach((Data)=>{
            qutytotal=Data.productId.offerPrire*Data.quantity
            cartTotal=cartTotal+qutytotal
        })
        if(cartTotal>min&&cartTotal<max){
            const discoundPrice = Math.round( cartTotal- cartTotal/ 100 * (100 - offers))
            let subtotal=cartTotal-discoundPrice
            req.session.orderTotal=subtotal
            res.send({dis:discoundPrice,total:subtotal})
        }else{ 
   
            res.send({err: "Invalid Amount",total:cartTotal,dis:0})

        }
    }
        
    } catch (error) {
        console.log(error.message)
    }
}





const checkOut=async(req,res)=>{
    try {
        const {user_id}=req.session
        const msg=req.flash('msg')
        const quty=req.flash('msg')
        const add= await address.findOne({UserId:user_id})
        const addres= await address.findOne({UserId:user_id})
        const carts=await cart.findOne({clientId:user_id}).populate('products.productId')
        const wallet=await Wallet.findOne({UserId:user_id})
        if(!carts.products.length==0){
            res.render('User/checkOut',{msg,addres,add,carts,quty,wallet})
        }else{
            res.redirect('/cart')
        }
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
        
        const addresCount= await address.findOne({ UserId:user_id})
        if(!firstData){
            if(addresCount?.address?.length>=1){
                await address.findOneAndUpdate({UserId: req.session.user_id, 'address.status': true},{$set: { 'address.$.status': false }})
                await address.findOneAndUpdate({UserId:user_id},{$addToSet:{ address:{name:name,phone:phone,pincode:pincode,state:state,city:city,place:place,locality:locality,status:true}}},{new:true,upsert:true})

            res.redirect('/checkout')
            }else{

             await address.findOneAndUpdate({UserId:user_id},{$addToSet:{ address:{name:name,phone:phone,pincode:pincode,state:state,city:city,place:place,locality:locality,status:true}}},{new:true,upsert:true})

            res.redirect('/checkout')
            }
        }else{
            req.flash('msg','locality already exists')
            res.redirect('/checkout')
        }
    
    } catch (error) {
        console.log(error.message)
    }
}




const checkutEditAddress=async(req,res)=>{
    
    try {
        const {ID}=req.body
        console.log(ID)
        const checkOutEditData=await address.findOne({'address._id':ID},{'address.$':1})
     
        res.json({checkOutEditData})
    } catch (error) {
        console.log(error.message)
    }
}


const checkOutAddressUpdate=async(req,res)=>{
    try {
        const {user_id}=req.session
        const {name,phone,place,pincode,locality,state,city,id}=req.body
       console.log(name,phone,place,pincode,locality,state,city,id)
       const editData= await address.findOneAndUpdate({UserId:user_id,'address._id':id},{$set:{'address.$.name':name,"address.$.phone":phone,'address.$.pincode':pincode,'address.$.state':state,'address.$.city':city,'address.$.place':place,'address.$.locality':locality}})
       req.flash('msg','Successfully')
       res.redirect('/checkout')
    } catch (error) {
        console.log(error.message)
    }
}


//change Address

const changeAdress=async(req,res)=>{
    try {
        await address.bulkWrite([
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
        
    
    } catch (error) {
        res.status(400).json({err:error})
    }
}







module.exports={
    Cart,
    checkOut,
    cartData,
    ApplyCoupon,
    addressData,
    quantityUpdate,
    counts,
    cartremove,
    changeAdress,
    checkutEditAddress,
    checkOutAddressUpdate
}