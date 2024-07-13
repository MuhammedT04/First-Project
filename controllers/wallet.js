const Wallet =require('../model/wallet')
const User=require('../model/user')
const instance=require('../config/razorPay')







const razorPay = async (req, res) => {
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


// Add wallet


const addWallet=async(req,res)=>{
    try {
        const addMoney = req.body.walletAdd
       await Wallet.findOneAndUpdate({UserId:req.session.user_id},{$inc:{balance:addMoney},$push:{transaction:{amount:addMoney,creditOrDebit:'credit'}}},{ upsert: true, new: true })
        res.redirect('/profile')
    } catch (error) {
        console.log(error.message)
    }
}


module.exports={
    razorPay,
    addWallet
}