const Orderlist=require('../model/order')
const Cart=require('../model/cart')
const Add=require('../model/address')


const order=async(req,res)=>{
    try {
        const {user_id}=req.session
        const {cash}=req.body
        const cart=await Cart.findOne({clientId:user_id})
        console.log(cart.products)
        const ADDRESS=await Add.findOne({UserId:user_id,'address.status':true},{'address.$':1})
        const {name,phone,place,pincode,locality,state,city} = ADDRESS?.address?.[0] ?? {};
        console.log(name,phone,place,pincode,locality,state,city)
        const products=cart.products

        


        
        const order=new Orderlist({
            UserId:user_id,
            products:products,
            deliveryAddress:{
                name:name,
                phone:phone,
                place:place,
                pincode:pincode,
                locality:locality,
                state:state,
                city:city
            },
            orderDate:Date.now(),
            orderAmount:cart.offerTotal,
            payment:"Cash on Delivery",
            orderStatus:'pending',
        })
       const savess= await order.save()
       if(savess){
        await Cart.findOneAndDelete({clientId:user_id})
        res.redirect("/ThankYou")
       }

    } catch (error) {
        console.log(error.message)
    }
}


const ThankYou=(req,res)=>{
  res.render('User/thanks')
}


module.exports={
    order,
    ThankYou
}