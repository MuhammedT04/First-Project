const  mongoose=require("mongoose");

const cart=mongoose.Schema({
    clientId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"zaraData"
    },
    products:[{
        productId:{
          type:mongoose.Schema.Types.ObjectId,
          ref:"product",
          required:true
        },
        quantity:{
            type:Number,
            required:true,
            default:1,
        },
        totalPrice:{
            type:Number,
            default:0
        },
        totalOfferPrice:{
            type:Number,
            required:true,
            default:0
        }
    }],
    total:{
        type:Number,
        default:0
    },
    offerTotal:{
        type:Number,
        default:0
    }
})

module.exports=mongoose.model('cart',cart)