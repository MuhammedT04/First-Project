const user=require('../model/user')


const logout = async (req,res,next)=>{
    try {
        if(req.session.user_id){
            res.redirect('/')
        }else{
            next()
        }
    } catch (error) {
        console.log(error.message)
        
    }
}

const login = async (req,res,next)=>{
    try {
        if(req.session.user_id){
         next()
        }else{
            res.redirect('/login')
        }
    } catch (error) {
        console.log(error.message)
        
    }
}

const blockorUnblock=async(req,res,next)=>{
    try{
        const id=req.session?.user_id || null
        const user1=await user.findOne({_id:id});
        
if(user1){
    if(user1.is_block){
        next()
    }else{
        req.session.destroy()
        res.redirect('/login')
    }
}else{
    next()
}
    }catch(err){
        console.log(err.message+'block');
    }
}


module.exports={
    logout,
    login,
    blockorUnblock
}