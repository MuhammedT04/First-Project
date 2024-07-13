const  mongoose=require("mongoose");
 

 
 const user=mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    phone:{
        type:String,
  
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    is_admin:{
        type:Boolean,
         default:false,
    },
    is_block:{
        type:Boolean,
        default:true,
        required:true
    },
    googleId:{
        type:String,
    },
    address:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"address"
    },
    coupons:[{
        couponId: { type: mongoose.Schema.Types.ObjectId, 
        ref:'coupon' 
    },
    code:{
        type:String
    },
    couponStatus: {
        type: String,
        enum: ['Expired','Claimed','Claim'], 
        default: 'Claim'
     },
     expiryDate:{
        type:Date,
        required: true,
    },
    }],
    refferalId:{
        type:String,
        required:true
    },
    refferalCodeSave:{
        type:String
    }
    
 })
 module.exports=mongoose.model('zaraData',user)  