const  mongoose=require("mongoose");
 

 
 const user=mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    phone:{
        type:String,
        required:true,
        unique:true
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
    
 })
 module.exports=mongoose.model('zaraData',user)  