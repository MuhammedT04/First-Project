const model=require('../model/user')
const bcrypt=require("bcrypt")



const sePassword = async (password) => {
    try {
        const pass = await bcrypt.hash(password, 10)
        return pass
    } catch (error) {
        console.log(error.message)
    }
}



 const login=async(req,res)=>{
    try {
        res.render('Admin/login')
    } catch (error) {
        console.log(error.message)
    }
 }

 //admin login 
 const loginadmin=async(req,res)=>{
    try {
        const email=req.body.email
        const admin= await model.findOne({email:email})
        
        console.log(admin)
        if(admin.is_admin===true){
            const pass=await bcrypt.compare(req.body.password,admin.password)
            if(pass){
                req.session.admin_id=admin._id
                res.redirect('/admin/home')
            }else{
                res.redirect('/admin/login')
            }
        }else{
            res.redirect('/admin/login')

        }
    } catch (error) {
        console.log(error.message)
    }
 }


 //admin home page
 const home=async(req,res)=>{
    try {
        res.render('admin/index')
    } catch (error) {
        console.log(error.message);
    }
 }


 //logout

 const logout=async(req,res)=>{
    try {
        req.session.admin_id=undefined
        res.redirect("/admin/login")
    } catch (error) {
        console.log(error.message)
    }
 }


 //user list 
 const userList=async(req,res)=>{
    try {
        const userdata=await model.find({is_admin:false})
        res.render('admin/userdata',{userdata:userdata})
    } catch (error) {
        console.log(error.message);
    }
 }
 
 //Block and Unblock


 const blockUser=async(req,res)=>{
    try {
        
        const {id}=req.body
        console.log(id);
        console.log('ooooooooo')
        const check=await model.findOne({_id:id})
        console.log(check)
        check.is_block=!check.is_block
        check.save()
    } catch (error) {
        console.log(error.message);
    }
 }






 module.exports={
    login,
    loginadmin,
    home,
    logout,
    userList,
    blockUser,
 } 