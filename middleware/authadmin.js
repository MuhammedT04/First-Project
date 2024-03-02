const logout = async (req,res,next)=>{
    try {
        if(req.session.admin_id){
            res.redirect('/admin/home')
        }else{
            next()
        }
    } catch (error) {
        console.log(error.message)
        
    }
}

const login = async (req,res,next)=>{
    try {
        if(!req.session.admin_id){
            res.redirect('/admin/login')
        }else{
            next()
        }
    } catch (error) {
        console.log(error.message)
        
    }
}

module.exports={
    logout,
    login
}