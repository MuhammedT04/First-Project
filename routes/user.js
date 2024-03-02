    const express = require('express');
    const router = express();
    const controllers=require('../controllers/user')
    const auth =require('../middleware/authuser')
    const session=require('express-session')
    // const googlecontrollers=require('../controllers/Google')
      //passport.js
    const googleLogin= require('../passport'); 


    router.get('/',auth.blockorUnblock,controllers.home)
    router.get('/logout',controllers.logout)
    router.get('/signUp',auth.logout,controllers.login)
    router.post('/login',controllers.logindata)

    router.get('/signUp',auth.logout,controllers.signUp)
    router.post('/signUp',controllers.signUpData)  

    router.get('/otp',auth.logout,controllers.otp)   
    router.post("/otp",controllers.otpdata)
    router.get('/ResendOtp',controllers.resendOtp)

    router.get('/product',controllers.SingleProduct)
    router.get('/shop',controllers.shop)



        
    //----------------- Login With Google -----------------//
    router.get('/auth/google', googleLogin.googleAuth);

  router.get("/auth/google/callback", googleLogin.googleCallback, googleLogin.setupSession);

    module.exports = router;
