const  mongoose=require("mongoose");

const wallit =mongoose.Schema({
    UserId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"zaraData"
    },
    balance:{
        type:Number,
         required:true,
         default:0
        },
    transaction:[{
        amount:{
            type:Number
        },
        date:{
            type: Date,
             default: Date.now 
            },
        creditOrDebit:{
            type:String,
            enum:['debit','credit']
        }
    }]
})


module.exports=mongoose.model('wallit',wallit)