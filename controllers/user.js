const model=require('../model/user')
const bcrypt=require("bcrypt")
const nodemailer=require("nodemailer")
const session=require('express-session')
const Product=require('../model/product')
const category=require('../model/category')
const product = require('../model/product')

//password hash
const sePassword= async (password)=>{
    try {
     const pass=await bcrypt.hash(password,10)
     return pass
 
    } catch (error) {
     console.log(error.message)
    }
 }


//sign up page

const signUp=async(req,res)=>{
    try {
        res.render('User/signUp')
    } catch (error) {
        console.log(error.message)
    }
}

const signUpData=async(req,res)=>{
    try {
        const spPassword= await sePassword(req.body.password)
        const checkMail = await model.findOne({email:req.body.email})
        console.log('1234567890-')
        if(!checkMail){

            const data= new model({
                name:req.body.name,
                phone:req.body.phone,
                email:req.body.email,
                password:spPassword,
            })
            req.session.sedata=data
            req.session.otp=generateOTP()
            console.log( req.session.otp);
            verifyemail(req.body.name,req.body.email,req.session.otp)
            console.log(req.session.sedata);
            res.redirect('/otp')
        }else{
            res.render("User/login",{message:"the email is already exist"})
        }
    } catch (error) {
        console.log(error.message)
    }
}



//login

const login=async(req,res)=>{
    try {
        const msg=req.flash('msg')
        res.render('User/login',{msg})
    } catch (error) {
        console.log(error.message) 
    }
}


const logindata=async(req,res)=>{
    try {

        const email=req.body.email
        const emaildata=await model.findOne({email:email})
        if(emaildata.is_block==true){ 
            const pass=await bcrypt.compare(req.body.password,emaildata.password)
            if(pass){
                req.session.user_id=emaildata._id
                res.redirect('/')
            }else{
                req.flash('msg','password is wrong')
                res.redirect("/login")
            }
        }else{
            req.flash('msg','Email is wrong')
            res.redirect("/login")
        }
        } catch (error) {
        console.log(error.message)
    }
}

//home page

const home=async(req,res)=>{
    try {
        
        const productData=await Product.find({status:true})
        const userss=req.session.user_id
        if(userss){
            res.render('User/index',{product:productData,User:userss}) 
        }else{
            res.render('User/index',{product:productData})
        }
        
    } catch (error) {
        console.log(error.message)
    }
}

//logout
const logout=async(req,res)=>{
    try {
        req.session.user_id=undefined
        res.redirect("/")
    } catch (error) {
        console.log(error.message)
    }
}

// fungctions

const generateOTP = () => {
    return Math.floor(1000 + Math.random() * 9000);
};


//verifyemail

const verifyemail = async (name, email, otp) => {
    try {
console.log(name,email,otp);
        const transport = nodemailer.createTransport({
            service: "gmail",

            auth: {
                user: "muhammedmhdt@gmail.com",
                pass: "ykoa imxo qvhh abbn",
            }
        });
        const mailoption = {
            from: "muhammedmhdt@gmail.com",
            to: email,
            subject: 'for verification mail',
            html: `<h1>hi ${name} this is for ka e-comares store verification otp <br><br> <a  style='color='blue'; href=''>${otp}</a></h1>`
        }
        transport.sendMail(mailoption, (err, info) => {
            if (err) {
                console.log(err.message);
            }
            else {
                console.log(`Email has been sent: ${info.messageId}`);
                console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
            }
        })
    } catch (error) {
        console.log(error.message);
    }
}


//Resend Otp


const resendOtp=async(req,res)=>{
    try {
        req.session.otp=undefined
        console.log(req.session.otp)
        if(req.session.otp===undefined){
            req.session.otp= generateOTP()
            console.log(req.session.otp)
            verifyemail(req.session.sedata.name,req.session.sedata.email, req.session.otp)
            res.redirect('/otp')
        }
    } catch (error) {
        console.log(error.message)
    }
}


//otp

const otp=async(req,res)=>{
    try {
        const msg=req.flash('msg')
        res.render('User/otp',{msg})
    } catch (error) {
        console.log(error.message)
    }
}


function combineOTP(parts){
    return parts.join("")
}


//otp check and data save 

const otpdata=async(req,res)=>{
    try {
       
        const otpParts=[
            req.body.otp1,
            req.body.otp2,
            req.body.otp3,
            req.body.otp4
             ]
             const ottp=combineOTP(otpParts)
             console.log(ottp);
             if(req.session.otp){
        if(ottp==req.session.otp){
            const fulldata= await model.create({
                name:req.session.sedata.name,
                phone:req.session.sedata.phone,
                email:req.session.sedata.email,
                password:req.session.sedata.password
            })
            if(fulldata){
                req.session.user_id=fulldata._id
                res.redirect('/')
            }else{
                res.redirect('/signUp')
            }
         
        }else{
            req.flash('msg','Otp is wrong')
            res.redirect('/otp')
        }
    }else{
        if(ottp==req.session.forgetOtp){
            res.redirect('/confirmpassword')
        }else{
            res.redirect('/otp')
        }
    }
    } catch (error) {
        console.log(error.message)
    }
}


//single Product

const SingleProduct=async(req,res)=>{
    try {
        const Id=req.query.id
        const singleData=await Product.findOne({_id:Id}).populate('category')
        const  recom=await product.find({_id:{$ne:Id}})

        res.render('User/product',{Data:singleData,recom})
    } catch (error) {
        console.log(error.message);
    }
}


//shop


const shop=async(req,res)=>{
    try {
        const shopProduct=await product.find({status:true})
        res.render("User/shop",{Data:shopProduct})
    } catch (error) {
        console.log(error.message)
    }
}


//forget Password

const forget=async(req,res)=>{
    try {
        res.render('User/forgetPassword')
    } catch (error) {
        console.log(error.message)
    }
}


//forget email checking

const EmailChecking=async(req,res)=>{
    try {
        const {email}=req.body
        const emailCheck=await model.findOne({email:email})
        if(emailCheck){
            req.session.email=email
            req.session.forgetOtp=generateOTP()
            console.log( req.session.forgetOtp);
            verifyemail('forget Password',email,req.session.forgetOtp)
            res.redirect('/otp')
        }else{
            res.redirect('/forget')
        }
    
    } catch (error) {
        console.log(error.message)
    }
}





//forget Resend Otp

const forgetResendOtp=async(req,res)=>{
    try {
        req.session.forgetOtp=undefined
        console.log(req.session.forgetOtp);
        if(req.session.forgetOtp==undefined){
            req.session.forgetOtp=generateOTP()
            console.log( req.session.forgetOtp);
            verifyemail('forget Password Resend Otp',email,req.session.forgetOtp)
            res.redirect('/otp')
        }else{
            res.redirect('/otp')
        }

    } catch (error) {
        console.log(error.message)
    }
}





//ConfirmPassword

const confirm=async(req,res)=>{
    try {
        res.render('User/confirmPassword')
    } catch (error) {
        console.log(error.message)
    }
}


const confirmPassword=async(req,res)=>{
    try {
        console.log(req.session.email)
        const {confirmPass}=req.body
        const spPassword= await sePassword(confirmPass)
        if(spPassword){
            const newPassword=await model.findOneAndUpdate({email:req.session.email},{$set:{password:spPassword}})
            req.flash('msg','successfully')
            res.redirect('/login')
        }else{
            req.redirect('/confirmpassword')
        }
    } catch (error) {
        console.log(error.message)
    }
}

module.exports={
    signUp,
    signUpData,
    login,
    logindata,
    home,
    logout,
    otp,
    otpdata,
    resendOtp,
    SingleProduct,
    shop,
    forget,
    EmailChecking,
    confirm,
    confirmPassword
}