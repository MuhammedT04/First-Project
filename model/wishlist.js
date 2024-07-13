const  mongoose=require("mongoose");

const wishlist=mongoose.Schema({
    UserId:{
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
     }]

})


module.exports=mongoose.model('wishlist',wishlist)