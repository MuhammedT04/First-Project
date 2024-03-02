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
    }
 })

 module.exports=mongoose.model('category',category)