const model = require('../model/user')
const bcrypt = require("bcrypt")
const Order = require('../model/order')
const Wallet=require('../model/wallet')
const instance=require('../config/razorPay')
const nodemailer=require("nodemailer")
const User =require("../model/user")
const Product =require('../model/product')
const sePassword = async (password) => {
    try {
        const pass = await bcrypt.hash(password, 10)
        return pass
    } catch (error) {
        console.log(error.message)
    }
}



const login = async (req, res) => {
    try {
        res.render('Admin/login')
    } catch (error) {
        console.log(error.message)
    }
}

//admin login 
const loginadmin = async (req, res) => {
    try {
        const email = req.body.email
        const admin = await model.findOne({ email: email })
        if (admin.is_admin === true) {
            const pass = await bcrypt.compare(req.body.password, admin.password)
            if (pass) {
                req.session.admin_id = admin._id
                res.redirect('/admin/home')
            } else {
                res.redirect('/admin/login')
            }
        } else {
            res.redirect('/admin/login')

        }
    } catch (error) {
        console.log(error.message)
    }
}


//admin home page
const home = async (req, res) => {
    try {
        
        const currentDate = new Date(); 
        const start = new Date(currentDate)
        start.setHours(0, 0, 0, 0); 
        const end = new Date(currentDate);
        end.setHours(23, 59, 59, 999); 
        const Today = await Order.find({orderDate: {$gte: start,$lte: end}}).count()
        const totalAomunt =await Order.aggregate([{
            $match:{'products.ProductStatus':'Delivered'}
            
        },
        {$group:{_id:null,totalValue:{$sum:'$orderAmount'}}},
    ])

        let Totals=totalAomunt[0]?.totalValue

       const user= await User.find().count()
       let array=[]
       let Return =0
       let Ordered=0
       let Delivered=0
       let Canceled=0
       const orderCounts = await Order.aggregate([
        {
            $unwind: "$products" 
        },
        {
            $group: {
                _id: "$products.ProductStatus", 
                count: { $sum: 1 } 
            }
        }
    ]);
    orderCounts.forEach(orderCount => {
        switch (orderCount._id) {
            case 'Return':
                Return = orderCount.count;
                break;
            case 'Ordered':
                Ordered = orderCount.count;
                break;
            case 'Delivered':
                Delivered = orderCount.count;
                break;
            case 'Canceled':
                Canceled = orderCount.count;
                break;
            default:
                break;
        }
    });
    array.push(Return,Ordered,Delivered,Canceled)

    //top 10 products
    const bestSellingTen = await Order.aggregate([
        { $unwind: '$products' },
        {
            $group: {
                _id: '$products.productId',
                totalQuantitySold: { $sum: '$products.quantity' },
                orderCount: { $sum: 1 }
            }
        },
        {
            $lookup: {
                from: 'products',
                localField: '_id',
                foreignField: '_id',
                as: 'productDetails'
            }
        },
        { $unwind: '$productDetails' },
        {
            $project: {
                productId: '$_id',
                productName: '$productDetails.name',
                productImage: '$productDetails.image',
                productPrice: '$productDetails.offerPrire',
                totalQuantitySold: 1,
                orderCount: 1
            }
        },
        { $sort: { orderCount: -1 } },
        { $limit: 10 }
    ]);



    const mostRepeatedProduct = await Order.aggregate([
        { $unwind: '$products' },
        {
            $group: {
                _id: '$products.productId',
                count: { $sum: 1 }
            }
        },
        { $sort: { count: -1 } },
        { $limit: 1 }
    ]);
    const ProductId = mostRepeatedProduct[0]._id
    const ProductCount = mostRepeatedProduct[0].count

    const product = await Product.findOne({ _id: ProductId })
    const prod = product.name



    //User Top  5
    const topUsers = await Order.aggregate([
        {
            $group: {
                _id: '$UserId',
                totalAmountSpent: { $sum: '$orderAmount' },
                orderCount: { $sum: 1 }
            }
        },
        {
            $lookup: {
                from: 'zaradatas',
                localField: '_id',
                foreignField: '_id',
                as: 'userDetails'
            }
        },
        { $unwind: '$userDetails' },
        {
            $project: {
                userName: '$userDetails.name',
                orderCount: 1,
                totalAmountSpent: 1
            }
        },
        { $sort: { totalAmountSpent: -1 } },
        { $limit: 5 }
    ]);

    const bestCategories = await Order.aggregate([
        { $unwind: '$products' },
        {
            $lookup: {
                from: 'products',
                localField: 'products.productId',
                foreignField: '_id',
                as: 'productDetails'
            }
        },
        { $unwind: '$productDetails' },
        {
            $group: {
                _id: '$productDetails.category',
                totalQuantity: { $sum: '$products.quantity' }
            }
        },
        { $sort: { totalQuantity: -1 } },
        { $limit: 10 },
        {
            $lookup: {
                from: 'categories',
                localField: '_id',
                foreignField: '_id',
                as: 'categoryDetails'
            }
        },
        { $unwind: '$categoryDetails' },
        {
            $project: {
                categoryName: '$categoryDetails.name',
                totalQuantity: 1
            }
        }
    ]);

    
        res.render('Admin/index',{Today,Totals,user,array,bestSellingTen,prod,ProductCount,topUsers,bestCategories})
    } catch (error) {
        console.log(error.message);
    }
}


//logout

const logout = async (req, res) => {
    try {
        req.session.admin_id = undefined
        res.redirect("/admin/login")
    } catch (error) {
        console.log(error.message)
    }
}


//user list 
const userList = async (req, res) => {
    try {
        const limit = 8;
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * limit;

        const totalProductCount = await model.countDocuments();
        const totalPages = Math.ceil(totalProductCount / limit);

        const userdata = await model.find({ is_admin: false }).skip(skip).limit(limit)
        res.render('Admin/userdata', { userdata: userdata, currentPage: page, totalPages })
    } catch (error) {
        console.log(error.message);
    }
}

//Block and Unblock


const blockUser = async (req, res) => {
    try {

        const { id } = req.body
        const check = await model.findOne({ _id: id })
        check.is_block = !check.is_block
        check.save()
    } catch (error) {
        console.log(error.message);
    }
}


//Return ///



const verifyemail = async (name,email,orderId,phoneNumber, accountNumber,amount,date) => {
    try {

        const transport = nodemailer.createTransport({
            service: "gmail",

            auth: {
                user: "muhammedmhdt@gmail.com",
                pass: "ykoa imxo qvhh abbn",
            }
        });
        const mailoption = {
            from: "muhammedmhdt@gmail.com",
            to: email,
            subject: 'for verification mail',
            html: `<html>
            <body style="font-family: 'Arial', sans-serif; background-color: #f4f4f4; padding: 20px;">
            <div style="max-width: 487px; margin: 0 auto; background-color: #fff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
                <h1 style="color: #333;justify-content: center; display: flex;font-family: cursive;">SLAY FIT</h1>
                <p style="color: #0b0c0c; line-height: 1.5;justify-content: center;display: flex;">Your refund details</p>
                <p style="font-size: 15px; font-weight: bold;">Order no :${orderId}</p>
                <p style="color: #555; line-height: 1;">${name}</p>
                <p style="color: #555; line-height: 1;"> account no .XXXXXX${accountNumber}</p>
                <p style="color: #555; line-height: 1;">No :${phoneNumber}</p>
                <p style="color: #555; line-height: 1;">Date :${date}</p>
                <p style="color: #555; line-height: 1;justify-content:center;display: flex; gap: 20px;"> Total amount    <span style="font-weight: 600;">   ${amount} /-</span> </p>
            </div>
            </body>
            </html>`
        }
        transport.sendMail(mailoption, (err, info) => {
            if (err) {
                console.log(err.message);
            }
            else {
                console.log(`Email has been sent: ${info.messageId}`);
                console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
            }
        })
    } catch (error) {
        console.log(error.message);
    }
}






const returns = async (req, res) => {
    try {
        const orderList = await Order.find({ 'Return.ReturnStatus': true }) .sort({'Return.OrderRequst':1}) .populate("UserId  products.productId")
        let arr = []
        orderList.forEach(e => {
            e.Return.forEach(elam=>{
                let obj = {}
                obj.OrderId = e.OrderId
                obj.UserId = e.UserId;
                obj.Return = elam;
                obj.deliveryName = e.deliveryAddress.name;
                obj.offer = e.offer
                obj.product = e.products.find(el => el._id == elam.productId)
                arr.push(obj)
            })
           
        })
        res.render('Admin/Return', { orderList: arr });
    } catch (er) {
        console.log(er.message)
    }
}



//return wallet add


const returnPriceAddWallet=async(req,res)=>{
    try {
        const {returnId,orderId,productID,Products}=req.body

        await Order.findOneAndUpdate({OrderId:orderId,'Return._id':returnId},{$set:{'Return.$.OrderRequst':'Approved'}},{new:true})
        const ReturnData=await Order.findOne({OrderId:orderId,'Return._id':returnId,'products._id':Products},{'Return.$':1}).populate('UserId products.productId').select({orderAmount:1,products:1,offer:1})
        const Returns=await Order.findOne({OrderId:orderId,'Return._id':returnId,'products._id':Products},{'products.$':1}).populate('products.productId')

        if(ReturnData.Return[0].OrderRequst==="Approved"){
            let productAndQuantity=Returns.products[0].productPrice*Returns.products[0].quantity
            let TotalPrice=Math.round( productAndQuantity/ 100 * (100 - ReturnData.offer))
         
             if(ReturnData.Return[0].ReturnMethod==="Wallet"){
                console.log(TotalPrice)
                  await Wallet.findOneAndUpdate({UserId:ReturnData.UserId._id},{$inc:{balance:TotalPrice},$push:{transaction:{amount:TotalPrice,creditOrDebit:'credit'}}},{ upsert: true, new: true })
                  let OrderPrice=ReturnData.orderAmount-TotalPrice
                  await Order.findOneAndUpdate({UserId:ReturnData.UserId._id,OrderId:orderId},{$set:{orderAmount:OrderPrice}})

             }else if(ReturnData.Return[0].ReturnMethod==="Bank Account"){

                let date = new Date();
                let formattedDate = `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear()}`;
                const account=String(ReturnData.Return[0].account)
                const number=account.slice(account.length-4,account.length)
    
                verifyemail(ReturnData.Return[0].accountHolderName,ReturnData.UserId.email,orderId,ReturnData.Return[0].phoneNumber,number,TotalPrice,formattedDate)
                let OrderPrice=ReturnData.orderAmount-TotalPrice
                  await Order.findOneAndUpdate({UserId:ReturnData.UserId._id,OrderId:orderId},{$set:{orderAmount:OrderPrice}})
             }
        }
     
    } catch (error) {
        console.log(error.message)
    }
}



const RazorPay = async (req, res) => {
    try {
            const user = await model.findOne({ _id:req.body.UserId })
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
                        msg: 'Send Bank',
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




module.exports = {
    login,
    loginadmin,
    home,
    logout,
    userList,
    blockUser,
    returns,
    returnPriceAddWallet,
    RazorPay
} 