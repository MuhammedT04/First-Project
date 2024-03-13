    const express = require('express');
    const router = express();
    const controllers=require('../controllers/user')
    const auth =require('../middleware/authuser')
    const session=require('express-session')
    const googleLogin= require('../passport'); 
    const controllerProfile=require('../controllers/userProfile')
    const controllerCart=require('../controllers/cart')
    const controllerOrder=require('../controllers/order')




    router.get('/',auth.blockorUnblock,controllers.home)
    router.get('/logout',controllers.logout)
    router.get('/login',auth.logout,controllers.login)
    router.post('/login',controllers.logindata)

    router.get('/signUp',auth.logout,controllers.signUp)
    router.post('/signUp',controllers.signUpData)  

    router.get('/otp',auth.logout,controllers.otp)   
    router.post("/otp",controllers.otpdata)
    router.get('/ResendOtp',controllers.resendOtp)

    router.get('/product',controllers.SingleProduct)
    router.get('/shop',controllers.shop)

    router.get('/forget',controllers.forget)
    router.post('/forget',controllers.EmailChecking)
    router.get('/confirmpassword',controllers.confirm)
    router.post('/confirmPassword',controllers.confirmPassword)

//Profile

router.get('/profile',controllerProfile.profile)
router.post('/userEdit',controllerProfile.profileEdit)
router.get('/myOrder',controllerProfile.myorder)
router.post('/changepasswor',controllerProfile.changePassword)
router.post('/addAddress',controllerProfile.Address)
router.put('/editAddress',controllerProfile.editAddress)
router.post('/editaddress',controllerProfile.editaddress)
router.post('/deleteAdderess',controllerProfile.deletes)

//Cart

router.get('/cart',auth.login,controllerCart.Cart)
router.post('/addtocart',controllerCart.cartData)
router.put('/quantityUpdate',controllerCart.quantityUpdate)
router.post('/cartDelete',controllerCart.cartremove)

//check Out

router.get('/checkout',auth.login,controllerCart.checkOut)
router.post('/address',controllerCart.addressData) 
router.post('/adressChange',controllerCart.changeAdress) 
          


//Order page

router.post('/order',controllerOrder.order)
router.get('/ThankYou',controllerOrder.ThankYou)




//Login With Google
    router.get('/auth/google', googleLogin.googleAuth);


  router.get("/auth/google/callback", googleLogin.googleCallback, googleLogin.setupSession);

    module.exports = router;
