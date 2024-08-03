const e = require("express");
const  mongoose=require("mongoose");

const Order=mongoose.Schema({
    
    OrderId:{
        type:Number,
        required:true
    },
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
        type:String,
        enum: ['Online Payment','Cash on Delivery','Wallet'], 
        required: true,
    },
    orderDate: {
        type: Date,
        required: true,
    },
    offer:{
        type:Number,
        default:0
    },
    paymentStatus:{
      type:String,
      enum:['Paid','Pending'],
      default:'Pending'
    },

         products:[{

            productId:{
              type:mongoose.Schema.Types.ObjectId,
              ref:"product",
              required:true
            },
            productPrice:{
              type:Number,
              required:true
            },

            quantity:{
                type:Number,
                required:true,
                default:1,
            }, 
               ProductStatus: {
                type: String,
                enum: ['Ordered', 'Shipped', 'Delivered','Canceled','Return'], 
                default: 'Ordered'
             },
             returnTime:{
              type:Date
             }

        }],

        Return:[{
          productId:{
            type:String
          },
              date:{
                type: Date,
                default: Date.now 
              },
              account:{
                type:Number
              },
              phoneNumber:{
                type:Number
              },
              accountHolderName:{
                type:String
              },
              ReturnMethod:{
                type:String,
                enum: ['Wallet','Bank Account'],
                default: 'Wallet'
              },
              ReturnStatus:{
                type:Boolean,
                default:false
              },
              reason:{
                type:String
              },
              OrderRequst:{
                type:String,
                enum:['Request','Approved'],
                default:'Request'
              }
        }]
})





module.exports=mongoose.model('orders',Order)