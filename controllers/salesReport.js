const cookieParser = require('cookie-parser');
const Order=require('../model/order')




const salesList=async(req,res)=>{
    try {
    
        switch (req.params.id) {
            case 'Daily':
                const currentDate = new Date(); 
                const start = new Date(currentDate)
                start.setHours(0, 0, 0, 0); 
                const end = new Date(currentDate);
                end.setHours(23, 59, 59, 999); 
                const Today = await Order.find({
                    'products.ProductStatus': 'Delivered',
                    orderDate: {
                        $gte: start,
                        $lte: end
                    }
                });
                res.render('Admin/salesReport', { Today });
                break;
            
            case 'Weekly':
                const day= new Date()
                const weekStart = new Date(day)
                weekStart.setDate(day.getDate() -7)
                const weeklyOrders = await Order.find({'products.ProductStatus':'Delivered',
                    orderDate: {
                        $gte:weekStart, 
                        $lte:day
                    }
                })
                res.render('Admin/salesReport',{Today:weeklyOrders})
                break;
                case 'Monthly':
                    const Daily= new Date()
                    const monthStart = new Date(Daily)
                    monthStart.setDate(Daily.getDate() -30)
                    const monthly=await Order.find({'products.ProductStatus':'Delivered',
                        orderDate:{
                            $gte:monthStart,
                            $lte:Daily
                        }
                    })
                    res.render('Admin/salesReport',{Today:monthly})
                    break;

            case 'Yearly':
               const Day= new Date()
               const OneYear = new Date(Day)
               OneYear.setFullYear(Day.getFullYear() -1)
           
              const YearlyOrders = await Order.find({'products.ProductStatus':'Delivered',
                orderDate: {
                    $gte:OneYear, 
                    $lte:Day
                }
            })
              res.render('Admin/salesReport',{Today:YearlyOrders})
                break;
            default:
                console.log('Sorry, we do not recognize that fruit.');
                break;
        }
       
    } catch (error) {
        console.log(error.message)
    }
}


//customDate


const customDate=async(req,res)=>{
    try {
        const {start,end}=req.body
        const custom = await Order.find({'products.ProductStatus':'Delivered',
        orderDate: {
            $gte:start, 
            $lte:end
        }
    })
      res.render('Admin/salesReport',{Today:custom})
    } catch (error) {
        console.log(error.message)
    }
}



//Char------------------------------------------------



const chart = async (req, res) => {
    try {
        let array = Array.from({ length: 12 }).fill(0);
    
        const currentYear = new Date().getFullYear();

        const chartData = await Order.aggregate([
            {
                $match: {
                    orderDate: {
                        $gte: new Date(currentYear, 0, 1),
                        $lte: new Date(currentYear, 11, 31, 23, 59, 59, 999)
                    }
                }
            },
            {
                $group: {
                    _id: { $month: "$orderDate" },
                    totalOrders: { $sum: 1 }
                }
            },
        ]);


        for (let i = 0; i < array.length; i++) {
            for (let j = 0; j < chartData.length; j++) {
                if (i + 1 === chartData[j]._id) {
                    array[i] = chartData[j].totalOrders;
                    break; 
                }
            }
        }

        res.send({array})
    } catch (error) {
        console.log(error.message);
    }
};


//ledger Book


const ledgerBook = async (req, res) => {
    try {
        const limit = 10;
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * limit;

        const totalProductCount = await Order.countDocuments({ 'products.ProductStatus': 'Delivered' });
        const totalPages = Math.ceil(totalProductCount / limit);
        const orders = await Order.find({ 'products.ProductStatus': 'Delivered' }).skip(skip).limit(limit)

        res.render('Admin/ledgerBook', {currentPage: page, totalPages, orders })
    } catch (error) {
        console.log(error.message);
    }
}


module.exports={
    salesList,
    customDate,
    chart,
    ledgerBook
}