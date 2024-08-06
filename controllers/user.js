const model=require('../model/user')
const bcrypt=require("bcrypt")
const nodemailer=require("nodemailer")
const Product=require('../model/product')
const category=require('../model/category')
const Cart=require('../model/cart')
const Wallet=require('../model/wallet')
const wishlist=require('../model/wishlist')
const Banner =require('../model/banner')

const generatecode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 10; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        code+= characters.charAt(randomIndex);
    }
    return code;
};




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
        const msg=req.flash('msg')
        res.render('User/signUp',{msg})
    } catch (error) {
        console.log(error.message)
    }
}

const signUpData=async(req,res)=>{
    try {
        const spPassword= await sePassword(req.body.password)
        const checkMail = await model.findOne({email:req.body.email})
        if(!checkMail){
            // const name = req.body.name;
            // const nameRegex = /^[a-zA-Z]+(?: [a-zA-Z]+)*$/;
        
            // if (!nameRegex.test(name.trim())) {
            //     req.flash('msg','Invalid Name Provided');
            //   res.redirect("/signUp");
            // }

            // const mobileRegex = /^\d{10}$/;
            // if (!mobileRegex.test(req.body.phone)) {
            //     req.flash('msg','Invalid Mobile Number Povided');
            //   return res.redirect("/signUp");
            // }
        

            // const email = req.body.email;
            // const emailRegex = /^[A-Za-z0-9.%+-]+@gmail\.com$/;
            // if (!emailRegex.test(email)) {
            //     req.flash('msg','Invalid Email Provided');
            //   res.redirect('/signUp');
            // }


            const data= new model({
                name:req.body.name,
                phone:req.body.phone,
                email:req.body.email,
                password:spPassword,
                refferalId:generatecode(),
                refferalCodeSave:req.body.refferal
            })
            
            req.session.sedata=data
            req.session.otp=generateOTP()
            console.log( req.session.otp);
            verifyemail(req.body.name,req.body.email,req.session.otp)
            console.log(req.session.sedata);
            let timer = Date.now()
            req.session.time = timer
            res.redirect(`/otp?time=${timer}`)
        }else{
            res.render("User/signUp",{message:"the email is already exist"})
        }
    } catch (error) {
        console.log(error.message)
    }
}



//login

const login=async(req,res)=>{
    try {
        const msg=req.flash('msg')
        res.render('User/login',{msg,cartCount:0})
    } catch (error) {
        console.log(error.message) 
    }
}


const logindata=async(req,res)=>{
    try {

        const email=req.body.email
        const emaildata=await model.findOne({email:email})
        if(emaildata.is_block==true&&emaildata.is_admin==false){ 
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
        
        const userss=req.session.user_id
        const productData=await Product.find({status:true}).populate({path:'category', match: { status: true }});
        const banner=await Banner.find({})
        
        if(userss){
            const wish = await wishlist.findOne({ UserId: userss })
            res.render('User/index',{product:productData,User:userss,wish,banner})
        }else{
         
            res.render('User/index',{product:productData,banner})
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
        if(req.session.otp===undefined){
            req.session.otp= generateOTP()
            console.log(req.session.otp)
            verifyemail(req.session.sedata.name,req.session.sedata.email, req.session.otp)
            res.redirect(`/otp?time=${req.session.time}`)
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

const otpdata = async (req, res) => {
    try {
        let checkReffealCode;

        const otpParts = [
            req.body.otp1,
            req.body.otp2,
            req.body.otp3,
            req.body.otp4
        ];
        const ottp = combineOTP(otpParts);
        console.log(ottp);

        if (req.session.otp) {
            if (ottp == req.session.otp) {
                if (req.session.sedata.refferalCodeSave) {
                    checkReffealCode = await model.findOne({ refferalId: req.session.sedata.refferalCodeSave });

                    console.log(checkReffealCode);

                    if (checkReffealCode) {
                    
                        await Wallet.findOneAndUpdate({ UserId: checkReffealCode._id }, { $inc: { balance: 100 }, $push: { transaction: { amount: 100, creditOrDebit: 'credit' } } }, { upsert: true, new: true });
                    } 
                }

                const fulldata = await model.create({
                    name: req.session.sedata.name,
                    phone: req.session.sedata.phone,
                    email: req.session.sedata.email,
                    password: req.session.sedata.password,
                    refferalId: req.session.sedata.refferalId,
                    refferalCodeSave: req.session.sedata.refferalCodeSave
                });

                if (fulldata) {
                    if (checkReffealCode) {
                        console.log('Updating wallet for user');
                        await Wallet.findOneAndUpdate({ UserId: fulldata._id }, { $inc: { balance: 100 }, $push: { transaction: { amount: 100, creditOrDebit: 'credit' } } }, { upsert: true, new: true });
                    }

                    req.session.user_id = fulldata._id;
                    return res.redirect('/');
                } else {
                    return res.redirect('/signUp');
                }
            } else {
                req.flash('msg', 'Otp is wrong');
                return res.redirect(`/otp?time=${req.session.time}`);
            }
        } else {
       
            if (ottp == req.session.forgetOtp) {
             
                return res.redirect('/confirmpassword');
            } else {
                return res.redirect('/otp');
            }
        }
    } catch (error) {
        console.log(error.message);
        return res.status(500).send("Internal Server Error");
    }
};







//single Product

const SingleProduct=async(req,res)=>{
    try {
        const Id=req.query.id
        if(Id.length!==24){
            return   res.redirect('/404')
        }
        const singleData=await Product.findOne({_id:Id}).populate('category')
        console.log(singleData.category._id,'singleData.category');
        if(!singleData){
            return   res.redirect('/404')
        }
        const  recom=await Product.find({_id:{$ne:Id},category:singleData.category._id}).populate('category')
        console.log(recom,"recom");
            res.render('User/product',{Data:singleData,recom})
       

       
    } catch (error) {
        console.log(error);
    }
}


//shop


const shop = async (req, res) => {
    try {
        const {user_id}=req.session
        const limit = 12;
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * limit;

        const totalProductCount = await Product.countDocuments({ status: true });
        const totalPages = Math.ceil(totalProductCount / limit);

        let shopProducts = await Product.aggregate([
            { 
                $match: { status: true } 
            },
            {
                $lookup: {
                    from: "categories", 
                    localField: "category",
                    foreignField: "_id",
                    as: "category"
                }
            },
            {$unwind: "$category"},{$match: { "category.status": true }},{$skip: skip},{  $limit: limit}
        ]);



        let noItems=false;
        if(req.query.search){
            const payload=req.query.search.trim()
            const content= new RegExp(`.*${payload}.*`,'i')
            shopProducts = await Product.find({
                $and: [
                    {
                        $or: [
                            { name: { $regex: content } },
                            { description: { $regex: content } }
                        ]
                    },
                    { status: true }
                ]
            }).populate('category').exec();
          
        }
        if(shopProducts.length===0){
            noItems=true
        }

       req.session.sorts=null
        if (req.session.user_id) {
            const wish = await wishlist.findOne({ UserId: req.session.user_id })
            res.render("User/shop", { currentPage: page, totalPages, shopProducts ,wish,user_id});
        } else {
            res.render("User/shop", { currentPage: page, totalPages, shopProducts,user_id });
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
};



const lowToHigh = async (req, res) => {
    try {
        let sortData
        const limit = 8;
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * limit;
        sortData=req.params.id
        const totalProductCount = await Product.countDocuments({ status: true });
        const totalPages = Math.ceil(totalProductCount / limit);
        if(req.session.sorts){

            let prices  
            if(req.params.id=='HighToLow'){
                prices=-1
            }else if(req.params.id=='LowToHigh'){
                prices=1
            }

            const datas =await Product.aggregate([
                {
                    $match: {
                      status: true,  
                    },
                },
                {
                  $lookup: { 
                    from: "categories",
                    localField: "category",
                    foreignField: "_id",
                    as: "category",
                  },
                },{
        
                    $unwind: "$category",
        
                },{
                    $match:{
                        'category.name': req.session.sorts
                    }
                },{$sort:{
                    price:prices
                }
            }
        ]);
        res.render("User/shop", {  shopProducts : datas });
        }
        const option = sortData == 'HighToLow' ? { offerPrire: -1 } : sortData == 'Alphabetic' ? { name: 1 } : sortData == 'LowToHigh' ? { offerPrire: 1 } : sortData == 'AlphabeticLow' ? { name: -1 } : { name: -1 };
        const shopProduct = await Product.find({ status: true }).populate({ path: 'category', match: { status: true } }).sort(option).skip(skip).limit(limit);
        req.session.sorts=sortData
        res.render("User/shop", { shopProducts: shopProduct, totalPages: totalPages, currentPage: page });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Internal Server Error");
    }
}




const Types=async(req,res)=>{
    try {
     
      
        if(req.session.sorts){
            let prices  
            if(req.session.sorts=='HighToLow'){
                prices=-1
            }else if(req.session.sorts=='LowToHigh'){
                prices=1
            }
    
    const datas =await Product.aggregate([
            {
                $match: {
                  status: true,  
                },
            },
            {
              $lookup: { 
                from: "categories",
                localField: "category",
                foreignField: "_id",
                as: "category",
              },
            },{
    
                $unwind: "$category",
    
            },{
                $match:{
                    'category.name': req.params.id
                }
            },{$sort:{
                price:prices
            }
        }
        ]);

            res.render("User/shop", {shopProducts:datas});
        }else{
            const data=await Product.aggregate([
                {
                    $match: {
                      status: true,  
                    },
                },
                {
                  $lookup: { 
                    from: "categories",
                    localField: "category",
                    foreignField: "_id",
                    as: "category",
                  },
                },{
        
                    $unwind: "$category",
        
                },{
                    $match:{
                        'category.name': req.params.id
                    }
                }
            ]);
        req.session.sorts=req.params.id
                res.render("User/shop", {  shopProducts : data });
        }

        

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



//404

const user404=async(req,res)=>{
    try {
        res.render('User/404')
    } catch (error) {
        console.log(error.message)
    }
}



//Blog


const Blog=async(req,res)=>{
    try {
        res.render('User/blog')
    } catch (error) {
        console.log(error.message)
    }
}


//Contact


const contact=async(req,res)=>{
    try {
        res.render('User/contact')
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
    lowToHigh,
    Types,
    forget,
    EmailChecking,
    confirm,
    confirmPassword,
    user404,
    Blog,
    contact,
}