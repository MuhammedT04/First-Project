const coupon=require('../model/Coupon')
const User=require('../model/user')


const generatecode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 10; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        code+= characters.charAt(randomIndex);
    }
    return code;
};

// Example usage:





//coupon List

const couponList=async(req,res)=>{
    try {
        const coupons=await coupon.find()
        res.render('Admin/couponList',{coupons})
    } catch (error) {
        console.log(error.message)
    }
}


// Add Coupon 


const AddCoupon=async(req,res)=>{
    try {
        res.render('Admin/AddCoupon')
    } catch (error) {
        console.log(error.message)
    }
}


const AddCouponData=async(req,res)=>{
    try {

        const {name,lowPrice,highPrice,days,offer,description,BuyLowPrice,BuyhighPrice}=req.body
        const currentDate = new Date();
        const expiryDate = new Date(currentDate);
        expiryDate.setDate(currentDate.getDate() + parseInt(days));
     
        const couponsave= new coupon({
            name:name,
            min:lowPrice,
            max:highPrice,
            expiryDate:expiryDate,
            offer:offer,
            code:generatecode(),
            dataDuration:days,
            description:description,
            buyLow:BuyLowPrice,
            buyHigh:BuyhighPrice
        })
        await couponsave.save()
        res.redirect('/admin/coupon')

    } catch (error) {
        console.log(error.message)
    }
}


// Edit coupon 

const EditCoupon=async(req,res)=>{
    try {
        const editData=await coupon.findOne({_id:req.params.id})
        res.render('admin/EditCoupon',{editData})
    } catch (error) {
        console.log(error.message)
    }
}


const updateCoupon=async(req,res)=>{
    try {
        const {name,lowPrice,highPrice,offer,days,description,ID,BuyLowPrice,BuyhighPrice}=req.body
        const currentDate = new Date();
        const expiryDate = new Date(currentDate);
        expiryDate.setDate(currentDate.getDate() + parseInt(days));
        const update= await coupon.findOneAndUpdate({_id:ID},{$set:{
            name:name,
            expiryDate:expiryDate,
            min:lowPrice,
            max:highPrice,
            offer:offer,
            dataDuration:days,
            description:description,
            buyLow:BuyLowPrice,
            buyHigh:BuyhighPrice
        }})
        if(update){
            res.redirect('/admin/coupon')
        }else{
            res.redirect('/admin/couponEdit')

        }
    } catch (error) {
        console.log(error.message)
    }
}



//Delete Coupon


const couponDelete=async(req,res)=>{
    try {
        const {ID}=req.body
        const couponREmove=await coupon.findOne({_id:ID})
        const userCoupon=await User.find({'coupons.code':couponREmove.code},{'coupons.$':1})
        for (const userCouponID of userCoupon) {
            const couponId = userCouponID.coupons[0]._id;

            await User.updateOne(
                { _id: userCouponID._id },
                { $pull: { coupons: { _id: couponId } } }
            );
        }
        await coupon.deleteOne({_id:ID})
        res.redirect('/admin/coupon')
    } catch (error) {
        console.log(error.message)
    }
}



module.exports={
    couponList,
    AddCoupon,
    AddCouponData,
    EditCoupon,
    updateCoupon,
    couponDelete
}