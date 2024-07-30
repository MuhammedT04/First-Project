const  mongoose=require("mongoose");

const banner=mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    image:{
        type:String
    },
    bannerPlace:{
        type:String
    }
})


module.exports=mongoose.model('banner',banner)