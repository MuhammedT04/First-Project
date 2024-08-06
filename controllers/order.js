const Orderlist=require('../model/order')
const Cart=require('../model/cart')
const Add=require('../model/address')
const User=require('../model/user')
const Product=require('../model/product')
require('dotenv').config()
const instance=require('../config/razorPay')
const session=require('express-session')
const coupon=require("../model/Coupon")
const Wallet=require("../model/wallet")


const generateOTP = () => {
    return Math.floor(1000000 + Math.random() * 9000000);
};



const order = async (req, res) => {
    try {
        const { user_id } = req.session;
        let payStutus
        if(req.body.payment=="Wallet"){
            payStutus="Paid"
        }else if(req.body.payment=="Online Payment"){
            payStutus=req.body.PayStatus
        }else{
            payStutus="Pending"
        }
        
        const cart = await Cart.findOne({ clientId: user_id }).populate('products.productId');
        
        let qutytotal=0
        let cartTotal=0
        if(!req.session.coupon){
            cart.products.forEach((Data)=>{
                qutytotal=Data.productId.offerPrire*Data.quantity
                cartTotal=cartTotal+qutytotal
            })
        }else{  
            cartTotal=req.session.orderTotal
            await User.findOneAndUpdate({_id:req.session.user_id,'coupons.code':req.session.code},{$set:{'coupons.$.couponStatus':'Claimed'}})

        }

        const passCouponUser=await coupon.find({
            buyLow:{$lte:cartTotal},
            buyHigh:{$gte:cartTotal}
        })  
        let result=true
        let g
      for(const offer of passCouponUser){
         result = await User.findOne({
            _id: req.session.user_id,
            coupons: {
                $elemMatch: {
                    code: offer.code
                }
            }
        })
        if(!result){
            g=offer
            break;
        } 
      }
        if(g){
            const currentDate = new Date()
            const expiryDate = new Date(currentDate)
            expiryDate.setDate(currentDate.getDate() + 15)
            await User.findOneAndUpdate({_id:req.session.user_id},{$addToSet:{coupons:{couponId:g._id,code:g.code,expiryDate:expiryDate}}})
        }
        if(req.body.payment=="Wallet"){

            const wallet=await Wallet.findOne({UserId:user_id})
            const walletPrice=wallet.balance-cartTotal
            await Wallet.findOneAndUpdate({UserId:user_id},{$set:{balance:walletPrice},$push:{transaction:{amount:cartTotal,creditOrDebit:'debit'}}},{ upsert: true, new: true })
        }


        const ADDRESS = await Add.findOne({ UserId: user_id, 'address.status': true }, { 'address.$': 1 });
        const { name, phone, place, pincode, locality, state, city } = ADDRESS?.address?.[0] ?? {};
        // const products = cart.products;

        const products = cart.products.map(product => ({
            productId: product.productId._id,
            productPrice: product.productId.offerPrire, 
            quantity: product.quantity
        }));

        const order = new Orderlist({
            UserId: user_id,
            products: products,
            deliveryAddress: {
                name: name,
                phone: phone,
                place: place,
                pincode: pincode,
                locality: locality,
                state: state,
                city: city
            },
            orderDate: Date(),
            orderAmount: cartTotal,
            payment: req.body.payment,
            OrderId: generateOTP(),
            offer:req.session.coupon,
            paymentStatus:payStutus
        });

        const savedOrder = await order.save();
        if (savedOrder) {
            for (const value of products) {
                let product = await Product.findOne({ _id: value.productId });
                let lastquty = product.quantity - value.quantity;
                await Product.findOneAndUpdate({_id: value.productId},{$set:{quantity:lastquty}})
            }
            await Cart.findOneAndDelete({ clientId: user_id });
            req.session.coupon=undefined
            res.redirect("/ThankYou");
        }
    } catch (error) {
        console.log(error.message);
    }
}



const ThankYou=(req,res)=>{
  res.render('User/thanks')
}


const razor = async (req, res) => {
    try {
        const addrescheck=await Add.findOne({UserId:req.session.user_id})
        if(addrescheck.address.length>0){

            const user = await User.findOne({ _id: req.body.userId })
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
                        msg: 'ORDER created',
                        order_id: order.id,
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
        }else{
            res.send({fail:true})
        }
    } catch (err) {
        console.log(err.message + ' razor')
    }
}




//............................................................ADMIN ORDER...............................................................\\

const adminOrder=async(req,res)=>{
    try {
        const limit = 8;
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * limit;

        const totalProductCount = await Orderlist.countDocuments();
        const totalPages = Math.ceil(totalProductCount / limit);
        const orderad=await Orderlist.find().populate('products.productId').sort({ orderDate: -1 }).skip(skip).limit(limit)
        res.render('Admin/orderList',{list:orderad,currentPage: page, totalPages})
    } catch (error) {
        console.log(error.message)
    }

}



const productDetails=async(req,res)=>{

    try {
    const OrderId=req.query.id
    const order= await Orderlist.findOne({OrderId:OrderId}).populate('products.productId UserId')
    res.render('Admin/orderDeteils',{order})
    } catch (error) {
        console.log(error.message)
    }
}




const updateOrderStatus = async (req, res) => {
    try {
        const { orderId, newStatus,ID } = req.body;
        let expiryDate
        if(newStatus==="Delivered"){
            const currentDate = new Date() 
            expiryDate = new Date(currentDate)
            expiryDate.setDate(currentDate.getDate() + 7)
            
        await Orderlist.findOneAndUpdate(
                { orderId: ID},
                { $set: { paymentStatus:"Paid" } },
                { new: true } 
            );
        }
        
        const updatedOrder = await Orderlist.findOneAndUpdate(
            { 'products._id': orderId },
            { $set: { 'products.$.ProductStatus': newStatus,'products.$.returnTime':expiryDate}},
            { new: true } 
        );
        res.json(updatedOrder);
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports={
    order,
    ThankYou,
    razor,

    adminOrder,
    productDetails,
    updateOrderStatus
}