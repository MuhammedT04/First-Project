const express = require('express');
const adminRouter = express();
const controllers=require('../controllers/admin')
const controllerproduct=require('../controllers/product')
const controllercategory=require('../controllers/category')
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
adminRouter.get('/Userdata',controllers.userList)
adminRouter.post('/blockUser',controllers.blockUser)
adminRouter.get('/logout',controllers.logout)


//product 

adminRouter.get('/product',auth.login,controllerproduct.product)
adminRouter.get('/AddProduct',auth.login,controllerproduct.addproduct)
adminRouter.post('/AddProducts',upload.array('image',4),controllerproduct.AddProductdata)
adminRouter.get('/EditProduct',auth.login,controllerproduct.productEdit)
adminRouter.post('/EditProduct',upload.array('image',4),controllerproduct.EditProductData)
adminRouter.post('/productBlock',controllerproduct.ProductBlock)
adminRouter.get('/deleteProduct',auth.login,controllerproduct.ProductDelete)
   
//category

adminRouter.get('/Category',auth.login,controllercategory.categorylist)
adminRouter.get('/AddCategory',auth.login,controllercategory.addcategory)
adminRouter.post('/AddCategory',controllercategory.categoryAddData)
adminRouter.get('/EditCategory',auth.login, controllercategory.categoryEdit);
adminRouter.post('/EditCategory',controllercategory.categoryEditData)
adminRouter.get('/DeleteCategory',auth.login,controllercategory.categoryDelete)
adminRouter.post('/categoryBlock',controllercategory.categoryBlock)




module.exports=adminRouter