const express=require('express')
const app=express()
const path=require('path')
const router=require('./routes/user')
const adminRouter=require('./routes/admin')
const session=require('express-session')
const  mongoose=require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/ZARA")
const nocache=require('nocache')
require('dotenv').config();
const flash=require('express-flash')


PORT=process.env.PORT

app.set('view engine','ejs')
app.use(session({
    secret:"first",
    resave:false,
    saveUninitialized:true
  }))
app.use(flash())
app.use(nocache())
app.use(express.json())

app.use(express.urlencoded({extended:true}))
app.use(express.static(path.join(__dirname,'public')))

app.use('/',router)
app.use('/admin',adminRouter)
   

app.listen(PORT,()=>{
  console.log("http://localhost:3000")
})