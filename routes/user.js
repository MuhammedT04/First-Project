    const express = require('express');
    const router = express();
    const controllers=require('../controllers/user')
    const auth =require('../middleware/authuser')
    const session=require('express-session')
    const googleLogin= require('../passport'); 
    const controllerProfile=require('../controllers/userProfile')
    const controllerCart=require('../controllers/cart')
    const controllerOrder=require('../controllers/order')
    const controllerwallet=require('../controllers/wallet')

    router.get('/404',controllers.user404)

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
    router.get('/filter/:id',controllers.lowToHigh)
    router.get('/type/:id',controllers.Types)

    router.get('/forget',controllers.forget)
    router.post('/forget',controllers.EmailChecking)
    router.get('/confirmpassword',controllers.confirm)
    router.post('/confirmPassword',controllers.confirmPassword)
    router.post('/searchHome',controllers.homeSearch)
    

//Profile

router.get('/profile',auth.login,controllerProfile.profile)
router.post('/userEdit',controllerProfile.profileEdit)
router.get('/myOrder',auth.login,controllerProfile.myorder)
router.post('/usercancel',controllerProfile.usercancel)
router.post('/changepasswor',controllerProfile.changePassword)
router.post('/addAddress',controllerProfile.Address)
router.put('/editAddress',controllerProfile.editAddress)
router.post('/editaddress',controllerProfile.editaddress)
router.post('/deleteAdderess',controllerProfile.deletes)
router.post('/wishlist',controllerProfile.Wishlist)
router.post('/wishlistremove',controllerProfile.removewishlist)
router.get('/invoice/:id',auth.login,controllerProfile.invoice)
router.post('/Repayment',controllerProfile.rePayment)
router.post('/orderRepaymet',controllerProfile.RepaymetStatus)

//Cart

router.get('/cart',auth.login,controllerCart.Cart)
router.post('/addtocart',controllerCart.cartData)
router.put('/quantityUpdate',controllerCart.quantityUpdate)
router.post('/cartDelete',controllerCart.cartremove)
router.post('/cartAction',controllerCart.counts)
//check Out

router.get('/checkout',auth.login,controllerCart.checkOut)
router.post('/address',controllerCart.addressData) 
router.post('/adressChange',controllerCart.changeAdress) 
router.post('/razor',controllerOrder.razor)   
router.post('/checkOutEdit',controllerCart.checkutEditAddress)     
router.post('/CheckOutEditAddress',controllerCart.checkOutAddressUpdate)

//Order page

router.post('/order',controllerOrder.order)
router.get('/ThankYou',auth.login,controllerOrder.ThankYou)


//Coupon

router.post('/applycoupon',controllerCart.ApplyCoupon)



//wallet

router.post('/razorPay',controllerwallet.razorPay)
router.post('/addWallet',controllerwallet.addWallet)


//Return 


router.post('/reason',controllerProfile.reason)
router.get('/returnMethod',controllerProfile.returnRequest)
router.post('/returnMethod',controllerProfile.ReturnMethods)


//Blog

router.get('/blog',controllers.Blog)


//Contact

router.get('/Contact',controllers.contact)


//Login With Google
    router.get('/auth/google', googleLogin.googleAuth);


  router.get("/auth/google/callback", googleLogin.googleCallback, googleLogin.setupSession);

    module.exports = router;
