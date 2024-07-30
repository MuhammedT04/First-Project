const  mongoose=require("mongoose");


const coupon=mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    expiryDate:{
        type:Date,
        required: true,
    },
    min:{
        type:Number,
        required:true
    },
    max:{
        type:Number,
        required:true
    },
    image:{
        type:String,
          default: '/image/coupon.png'
    },
    offer:{
        type:Number,
        required:true
    },
    code:{
        type:String,
        required:true
    },
    dataDuration:{
        type:String
    },
    description:{
        type:String,
        required:true
    },
    buyLow:{
        type:Number,
        required:true
    },
    buyHigh:{
        type:Number,
        required:true
    }
})

module.exports=mongoose.model("coupon",coupon)