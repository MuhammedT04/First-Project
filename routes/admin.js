const express = require('express');
const adminRouter = express();
const controllers=require('../controllers/admin')
const controllerproduct=require('../controllers/product')
const controllercategory=require('../controllers/category')
const controllerOrder=require('../controllers/order')
const controllerCoupon=require('../controllers/coupon')
const controllerOffer=require('../controllers/offer')
const controllerSalesReport=require('../controllers/salesReport')
const multer=require('multer')
const path =require('path');
const auth=require('../middleware/authadmin')


const storage=multer.diskStorage({
    destination:function(req,file,img){
        img(null,path.join(__dirname,'../public/ImageData'))
    },
    filename:function(req,file,img){
        const name=Date.now()+'-'+file.originalname;
        img(null,name)
    }
})
const upload=multer({storage:storage})



//admin

adminRouter.get('/login',auth.logout,controllers.login)
adminRouter.post('/login',controllers.loginadmin)
adminRouter.get('/home',auth.login,controllers.home)
adminRouter.get('/Userdata',auth.login,controllers.userList)
adminRouter.post('/blockUser',auth.login,controllers.blockUser)
adminRouter.get('/logout',controllers.logout)

adminRouter.get('/returnlist',auth.login,controllers.returns)
adminRouter.post('/ReturnRequst',auth.login,controllers.returnPriceAddWallet)
adminRouter.post('/razorPay',controllers.RazorPay)
//product 

adminRouter.get('/product',auth.login,controllerproduct.product)
adminRouter.get('/AddProduct',auth.login,controllerproduct.addproduct)
adminRouter.post('/AddProducts',auth.login,upload.array('image',4),controllerproduct.AddProductdata)
adminRouter.get('/EditProduct',auth.login,controllerproduct.productEdit)
adminRouter.post('/EditProduct',auth.login,upload.array('image',4),controllerproduct.EditProductData)
adminRouter.post('/productBlock',auth.login,controllerproduct.ProductBlock)
adminRouter.get('/deleteProduct',auth.login,controllerproduct.ProductDelete)
   
//category

adminRouter.get('/Category',auth.login,controllercategory.categorylist)
adminRouter.get('/AddCategory',auth.login,controllercategory.addcategory)
adminRouter.post('/AddCategory',auth.login,controllercategory.categoryAddData)
adminRouter.get('/EditCategory',auth.login, controllercategory.categoryEdit);
adminRouter.post('/EditCategory',auth.login,controllercategory.categoryEditData)
adminRouter.get('/DeleteCategory',auth.login,controllercategory.categoryDelete)
adminRouter.post('/categoryBlock',auth.login,controllercategory.categoryBlock)


//Order 

adminRouter.get('/OrderList',auth.login,controllerOrder.adminOrder)
adminRouter.get('/productview',auth.login,controllerOrder.productDetails)
adminRouter.post('/updateOrderStatus',auth.login, controllerOrder.updateOrderStatus);


//Coupon

adminRouter.get("/coupon",auth.login,controllerCoupon.couponList)
adminRouter.get('/AddCoupon',auth.login,controllerCoupon.AddCoupon)
adminRouter.post('/addcoupon',auth.login,upload.single('image'),controllerCoupon.AddCouponData)
adminRouter.get('/couponEdit/:id',auth.login,controllerCoupon.EditCoupon)
adminRouter.post('/EditCoupon',auth.login,controllerCoupon.updateCoupon)
adminRouter.post('/couponDelete',auth.login,controllerCoupon.couponDelete)


//Offer 

adminRouter.get("/offerList",auth.login,controllerOffer.offerList)
adminRouter.get('/addOffer',auth.login,controllerOffer.AddOffer)
adminRouter.post('/AddOffer',auth.login,controllerOffer.addOfferData)
adminRouter.get('/EditOffer/:id',auth.login,controllerOffer.EditOffer)
adminRouter.post('/EditOffer',auth.login,controllerOffer.EditUpdateData)
adminRouter.post('/productOffer',auth.login,controllerOffer.singleProduct)
adminRouter.post('/categoryOffer',auth.login,controllerOffer.categoryOffer)
adminRouter.post('/offerDelete',auth.login,controllerOffer.deleteOffer)

// Sales Report

adminRouter.get('/SalesReport/:id',auth.login,controllerSalesReport.salesList)
adminRouter.post('/customDate',auth.login,controllerSalesReport.customDate)
adminRouter.get('/ledgerBook',auth.login,controllerSalesReport.ledgerBook)

//chart

adminRouter.get('/chart',auth.login,controllerSalesReport.chart)

//Banner 

adminRouter.get('/banner',auth.login,controllerproduct.banner)
adminRouter.get('/EditBanner',auth.login,controllerproduct.EditBanner)
adminRouter.post('/updateBanner',auth.login,upload.single('image'),controllerproduct.dataUpdate)

module.exports=adminRouter