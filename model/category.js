const  mongoose=require("mongoose");
 
 

 const category=mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    status:{
        type:Boolean,
        default:true,
        required:true
    },
    offer:{
        type:Number,
        default:0
    }
 })

 module.exports=mongoose.model('category',category)