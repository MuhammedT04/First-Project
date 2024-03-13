const  mongoose=require("mongoose");

const Order=mongoose.Schema({
    UserId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'zaraData'
    },
    orderAmount:{
        type:Number,
        required:true
    },
    deliveryAddress:{
        name:{type:String, required:true },
        phone:{type:String,},
        pincode:{type:Number,required:true},
        place:{type:String,required:true},
        city:{type:String,required:true},
        state:{type:String,required:true},
        locality:{type:String,required:true},
},
    payment:{
        typr:String
    },
    orderDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    orderStatus: { 
        type: String,
         enum: ['pending', 'shipped', 'delivered','canceled'], 
         default: 'pending'
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
})

module.exports=mongoose.model('orders',Order)