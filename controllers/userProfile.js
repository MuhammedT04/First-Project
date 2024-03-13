const User=require('../model/user')
const session=require('express-session')
const product=require('../model/product')
const bcrypt=require("bcrypt")
const add=require('../model/address')
const order=require('../model/order')
const sePassword= async (password)=>{
    try {
     const pass=await bcrypt.hash(password,10)
     return pass
 
    } catch (error) {
     console.log(error.message)
    }
 }


// User Profile

const profile=async(req,res)=>{

    try {

        const data=req.session.user_id
        if(data){
            // const edit=await add.findOne({_id:id})
            const full=await User.findOne({_id:data})
            const orders=await order.find({UserId:data}).populate('products.productId')
            console.log(orders.products,'oooooooox')
            const msg=req.flash('msg')
            const addres= await add.find({UserId:req.session.user_id})
            res.render('User/profile',{Data:full,msg,orders,add:addres,user:data})
        }
    } catch (error) {
        console.log(error.message)
    }
}

//User Profile Edit


const profileEdit=async(req,res)=>{
    try {
        const {name,phone}=req.body
        // const phones=await User.findOne({phone:phone})
        // if(!phones){
            console.log(req.body.id,'oilsfjulilsdhflashfklh00000000000000')
            const profileEditData= await User.findByIdAndUpdate({_id:req.body.id},{set:{name:name,phone:phone}})
            if(profileEditData){
                console.log(profileEditData,'jdfjdfjkfksf');
                req.flash('msg','success')
                res.redirect('/profile')
            }else{
                 req.flash('msg','noooo')
                res.redirect('/profile')
        // }else{
            // console.log('mmmmmmmmmmmmmmmm');
            // req.flash('msg','phone already exists')
            // res.redirect('/profile')
        }
    } catch (error) {
        console.log(error.message);
    }
}

//My Order

const myorder=async(req,res)=>{
    try {
        res.render('User/myOrder')
    } catch (error) {
        console.log(error.message)
    }
}


//change password

const changePassword=async(req,res)=>{
    try {
        const {oldpass,confirmPass}=req.body
        const spPassword= await sePassword(confirmPass)
        const user= await User.findOne({_id:req.session.user_id})
        if(user){
            const pass=await bcrypt.compare(oldpass,user.password)
            if(pass){
                const passUpdate=await User.findOneAndUpdate({_id:req.session.user_id},{$set:{password:spPassword}})
                req.flash('msg','Successfully Change Password')
                res.redirect('/profile')
            }else{
                req.flash('msg','New Password is wrong')
                res.redirect('/profile')
            }
        }else{
            req.flash('msg','Old Password is wrong')
            res.redirect('/profile')
        }
       
    } catch (error) {
        console.log(error.message)
    }
}


const Address=async(req,res)=>{
    try {
        const {user_id}=req.session
       
        const {name,phone,pincode,state,city,place,locality}=req.body
       
        const firstData=await add.findOne({
            UserId:user_id,
            address: {
                $elemMatch: {
                    locality:locality
                }
            }
        })
        console.log('jsdhsdhjdshjsdjhsdjhsdjhsdjh');
        if(!firstData){
            const newAddAddress= await add.findOneAndUpdate({UserId:user_id},{$addToSet:{ address:{name:name,phone:phone,pincode:pincode,state:state,city:city,place:place,locality:locality}}},{new:true,upsert:true})
         
            req.flash('msg','Successfully')
            res.redirect('/profile')
        }else{
            
            req.flash('msg','locality already exists')
            res.redirect('/profile')
        }
    } catch (error) {
        console.log(error.message)
    }
}


const editAddress=async(req,res)=>{
    
    try {
        const {edit}=req.body
        const editdata=await add.findOne({'address._id':edit},{'address.$':1})
        res.json({editdata})
    } catch (error) {
        console.log(error.message)
    }
}



const editaddress=async(req,res)=>{
    try {
        const {user_id}=req.session
        const {name,phone,place,pincode,locality,state,city,id}=req.body
        // const check=await add.findOne({'address.locality':locality})         
       const editData= await add.findOneAndUpdate({UserId:user_id,'address._id':id},{$set:{'address.$.name':name,"address.$.phone":phone,'address.$.pincode':pincode,'address.$.state':state,'address.$.city':city,'address.$.place':place,'address.$.locality':locality}})
       req.flash('msg','Successfully')
       res.redirect('/profile')
        
    } catch (error) {
        console.log(error.message)
    }
}


//address delete

const deletes=async(req,res)=>{
    try {
        const ID=req.body.ID
        console.log(ID)
        await add.findOneAndUpdate({UserId:req.session.user_id},{$pull:{address:{_id:ID}}},{new:true})
        res.redirect('/profile')
    } catch (error) {
        console.log(error.message)
    }
}


module.exports={
    profile,  
    profileEdit,
    myorder,
    changePassword,
    Address,
    editAddress,
    editaddress,
    deletes
}