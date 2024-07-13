const User=require('../model/user')
const session=require('express-session')
const product=require('../model/product')
const bcrypt=require("bcrypt")
const add=require('../model/address')
const order=require('../model/order')
const wishlist=require('../model/wishlist')
const Wallet=require('../model/wallet')
const instance=require('../config/razorPay')

const sePassword= async (password)=>{
    try {
     const pass=await bcrypt.hash(password,10)
     return pass
 
    } catch (error) {
     console.log(error.message)
    }
 }


// User Profile

const profile=async(req,res)=>{

    try {

        const data=req.session.user_id
        if(data){
            const full=await User.findOne({_id:data})
            const orders=await order.find({UserId:data}).populate('products.productId').sort({ orderDate: -1 });
            const msg=req.flash('msg')
            const wishlists = await wishlist.findOne({ UserId: req.session.user_id }).populate('products.productId');
            const couponlist=await User.findOne({_id:req.session.user_id}).populate({path:'coupons.couponId',model:'coupon'})
            const wallet = await Wallet.findOne({ UserId: req.session.user_id }).sort({ 'transaction.date': -1 });
            const couponExpired=await User.findOne({_id:req.session.user_id}).populate('coupons.couponId')
            const orderPending=await order.find({UserId:data,paymentStatus:'Pending',payment:'Online Payment'}).populate('products.productId');
            console.log(orderPending)
            if(Date()>couponExpired.coupons.expiryDate){
                await User.findOneAndUpdate({_id:req.session.user_id},{$set:{'coupons.$.couponStatus':'Expired'}})
            }

            const addres= await add.find({UserId:req.session.user_id})
            res.render('User/profile',{Data:full,msg,orders,add:addres,user:data,wishlists,couponlist,wallet,orderPending})
        }
    } catch (error) {
        console.log(error.message)
    }
}

//User Profile Edit


const profileEdit=async(req,res)=>{
    try {
        const {name,phone}=req.body
            const profileEditData= await User.findByIdAndUpdate({_id:req.body.id},{set:{name:name,phone:phone}})
            if(profileEditData){
                req.flash('msg','success')
                res.redirect('/profile')
            }else{
                 req.flash('msg','noooo')
                res.redirect('/profile')
        }
    } catch (error) {
        console.log(error.message);
    }
}

//My Order

const myorder=async(req,res)=>{
    try {
        const Id=req.query.id
        const OrderProductData=await order.findOne({'products._id':Id},{'products.$':1,deliveryAddress:1,OrderId:1,payment:1}).populate('products.productId').select({Return:1})
        res.render('User/myOrder',{order:OrderProductData})
    } catch (error) {
        console.log(error.message)
    }
}




//User Cancel

const usercancel=async(req,res)=>{
    try {
        const {user_id}=req.session
        const {id,orderId}=req.body
         const canceled= await order.findOneAndUpdate({UserId:user_id,'products._id':id},{$set:{'products.$.ProductStatus':'Canceled'}},{'products.$':1},{new:true})
         if(canceled){
             const check = await order.findOne({UserId: user_id,'products._id':id},{'products.$':1}).populate('products.productId');
             const offer =await order.findOne({OrderId:orderId})
             let productTotal=0
             productTotal=check.products[0].productId.offerPrire*check.products[0].quantity
             productTotal=Math.round( productTotal/ 100 * (100 - offer.offer))
             if(check.products[0].ProductStatus=="Canceled"){
                const findOrderPrice=await order.findOne({OrderId:orderId})
               let orderCancelPrice=findOrderPrice.orderAmount-productTotal
               await order.findOneAndUpdate({OrderId:orderId},{$set:{orderAmount:orderCancelPrice}},{new:true})
               if(findOrderPrice.payment=="Online Payment"&&findOrderPrice.paymentStatus=="Paid"||findOrderPrice.payment=="Wallet"){
                await Wallet.findOneAndUpdate({UserId:req.session.user_id},{$inc:{balance:productTotal},$push:{transaction:{amount:productTotal,creditOrDebit:'credit'}}},{ upsert: true, new: true })
               }
             }
         }
    }catch (error) {
        console.log(error)
    }
}



//change password

const changePassword=async(req,res)=>{
    try {
        const {oldpass,confirmPass}=req.body
        const spPassword= await sePassword(confirmPass)
        const user= await User.findOne({_id:req.session.user_id})
        if(user){
            const pass=await bcrypt.compare(oldpass,user.password)
            if(pass){
                const passUpdate=await User.findOneAndUpdate({_id:req.session.user_id},{$set:{password:spPassword}})
                req.flash('msg','Successfully Change Password')
                res.redirect('/profile')
            }else{
                req.flash('msg','New Password is wrong')
                res.redirect('/profile')
            }
        }else{
            req.flash('msg','Old Password is wrong') 
            res.redirect('/profile')
        }
       
    } catch (error) {
        console.log(error.message)
    }
}


const Address=async(req,res)=>{
    try {
        const {user_id}=req.session
       
        const {name,phone,pincode,state,city,place,locality}=req.body
       
        const firstData=await add.findOne({
            UserId:user_id,
            address: {
                $elemMatch: {
                    locality:locality
                }
            }
        })
        if(!firstData){
            const newAddAddress= await add.findOneAndUpdate({UserId:user_id},{$addToSet:{ address:{name:name,phone:phone,pincode:pincode,state:state,city:city,place:place,locality:locality}}},{new:true,upsert:true})
         
            req.flash('msg','Successfully')
            res.redirect('/profile')
        }else{
            
            req.flash('msg','locality already exists')
            res.redirect('/profile')
        }
    } catch (error) {
        console.log(error.message)
    }
}


const editAddress=async(req,res)=>{
    
    try {
        const {edit}=req.body
        const editdata=await add.findOne({'address._id':edit},{'address.$':1})
        res.json({editdata})
    } catch (error) {
        console.log(error.message)
    }
}



const editaddress=async(req,res)=>{
    try {
        const {user_id}=req.session
        const {name,phone,place,pincode,locality,state,city,id}=req.body
        // const check=await add.findOne({'address.locality':locality})         
       const editData= await add.findOneAndUpdate({UserId:user_id,'address._id':id},{$set:{'address.$.name':name,"address.$.phone":phone,'address.$.pincode':pincode,'address.$.state':state,'address.$.city':city,'address.$.place':place,'address.$.locality':locality}})
       req.flash('msg','Successfully')
       res.redirect('/profile')
        
    } catch (error) {
        console.log(error.message)
    }
}


//address delete

const deletes=async(req,res)=>{
    try {
        const ID=req.body.ID
        await add.findOneAndUpdate({UserId:req.session.user_id},{$pull:{address:{_id:ID}}},{new:true})
        res.redirect('/profile')
    } catch (error) {
        console.log(error.message)
    }
}



//Wishlist 


const Wishlist =async(req,res)=>{
    try {
        const {productId}=req.body
        const result = await wishlist.findOne({
            UserId : req.session.user_id,
            products: {
                $elemMatch: {
                    productId: productId
                }
            }
        })
        if(!result){
            const wishlistData=await wishlist.findOneAndUpdate({UserId:req.session.user_id},{$addToSet:{ products:{productId:productId}}},{new:true,upsert:true})
           res.send({succ:true})
        }else{
            const aaa=await wishlist.findOneAndUpdate({UserId:req.session.user_id},{$pull:{products:{productId:productId}}},{new:true})

            res.send({fail:true})
        }
    } catch (error) {
        console.log(error.message)
    }
}



// Removewishlist


    const removewishlist=async(req,res)=>{
        try {
            const remove=await wishlist.findOneAndUpdate({UserId:req.session.user_id},{$pull:{products:{productId:req.body.remove}}},{new:true})
            res.redirect('/profile')
        } catch (error) {
            console.log(error.message)
        }
    }



    //return Reason


    const reason = async (req, res) => {
        try {
            console.log(req.body,'/////////////|||||||');
            req.session.reason=req.body.checked
            req.session.productId=req.body.Id
            req.session.orderId=req.body.orderId
            console.log(req.session.orderId)
             await order.findOneAndUpdate({UserId:req.session.user_id,'products._id':req.body.Id},{$set:{'products.$.ProductStatus':'Return'}},{'products.$':1},{new:true})
            res.redirect('/returnMethod');
        } catch (error) {
            console.log(error.message);
        }
    };
    


// User Return 

const returnRequest=async(req,res)=>{
    try {
        res.render('user/returnRequest')
    } catch (error) {
        console.log(error.message)
    }
}



const ReturnMethods=async(req,res)=>{
    try {
        const {name,phone,accountNumber,choose}=req.body
        const accountDate=await order.findOneAndUpdate({UserId:req.session.user_id,OrderId:req.session.orderId},{$push:{Return:{account:accountNumber,phoneNumber:phone,accountHolderName:name,ReturnMethod:choose,ReturnStatus:true,reason:req.session.reason,productId: req.session.productId}}})
        req.session.reason=null
        req.session.productId=null
        req.session.orderId=null
        console.log(accountDate)
        res.redirect('/profile')
    } catch (error) {
        console.log(error.message)
    }
}




//invoice//


const invoice=async(req,res)=>{
    try {
        const {id}=req.params
        const {OrderId}=req.query
        console.log(OrderId,id)
        const invoiceData=await order.findOne({OrderId:OrderId,'products._id':id},{'products.$':1,deliveryAddress:1,orderDate:1,OrderId:1,offer:1}).populate('products.productId')
        console.log(invoiceData)
        res.render('user/invoice',{invoiceData})
    } catch (error) {
        console.log(error.message)
    }
}



//RePayment



const rePayment = async (req, res) => {
    try {
            const user = await User.findOne({ _id: req.session.user_id })
            const amount = req.body.amount * 100
            const options = {
                amount,
                currency: "INR",
                receipt: 'muhammedmhdt@gmail.com'
            }
            
            instance.orders.create(options, (err, order) => {
                if (!err) {
                    res.send({
                        succes: true,
                        msg: 'Amount Add',
                        amount,
                        key_id: process.env.RAZORPAY_IDKEY,
                        name: user.name,
                        email: user.email
                    })
                } else {
                    console.error("Error creating order:", err);
                    res.status(500).send({ success: false, msg: "Failed to create order" });
                }
            })
    } catch (err) {
        console.log(err.message + ' razor')
    }
}



const RepaymetStatus=async(req,res)=>{
    try {
        const {status,orderId}=req.body
        await order.findOneAndUpdate({UserId:req.session.user_id,OrderId:orderId},{$set:{paymentStatus:status}},{new:true})
        res.redirect('/profile')
    } catch (error) {
        console.log(error.message)
    }
}


module.exports={
    profile,  
    profileEdit,
    myorder,
    usercancel,
    changePassword,
    Address,
    editAddress,
    editaddress,
    deletes,
    Wishlist,
    removewishlist,
    returnRequest,
    reason,
    ReturnMethods,
    invoice,
    rePayment,
    RepaymetStatus
}