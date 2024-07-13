const  mongoose=require("mongoose");
 
 const products=mongoose.Schema({
    name:{
        type:String,
        required:true
    },
     category:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"category"
     },
     price:{
        type:Number,
        required:true
     },
     status:{
        type:Boolean,
        required:true,
        default:true
     },
     quantity:{
        type:Number,
        required:true
     },
     date:{
        type:Date,
        required:true
     },
     image:{
        type:Array,
        required:true
     },
     description:{
        type:String,
        required:true
     },
     offer:{
      type:Number,
      default:0
     },
     offerPrire:{
      type:Number,
     }
 })

 module.exports=mongoose.model('product',products)