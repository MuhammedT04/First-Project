const  mongoose=require("mongoose");

const Offer=mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    offer:{
        type:Number,
        required:true
    }
})

module.exports=mongoose.model('offer',Offer)