const Tour = require('../models/tourmodel');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.getOverviews=catchAsync(async(req,res,next)=>{
 //  1. collection all tour data
    const tours = await Tour.find();

 //  2. Bulid Template 

    res.status(200)
    .set( 'Content-Security-Policy',
    "script-src 'self' https://cdnjs.cloudflare.com/ajax/libs/axios/1.3.3/axios.min.js http://js.stripe.com/v3/'unsafe-inline' 'unsafe-eval';"
    )
    .render('overview',{
      title:'All tours',
      tours
    });
});

exports.getTour=catchAsync(async(req,res,next)=>{
  // 1. Get all  the data are collection
  const tour = await Tour.findOne({ slug : req.params.slug}).populate({
    path:'reviews',
    fields:'review rating user'
  });



  if(!tour){
    return next(new AppError('this is page are not found',404))

  }
 // 2.Bulid templete

  res.status(200).set( 'Content-Security-Policy',
  "script-src 'self'  'https://js.stripe.com/v3/' 'unsafe-inline' 'unsafe-eval';"
  ).render('tour',{
    title:`${tour.name} tour`,
    tour
    });
});

exports.getLoginForm = (req,res)=>{
  
  res
  .status(200)
  .set( 'Content-Security-Policy',
  "script-src 'self' https://cdnjs.cloudflare.com/ajax/libs/axios/1.3.3/axios.min.js 'unsafe-inline' 'unsafe-eval';"
  ).render('login',{
    title:"Login into Your Account "

  });
};


exports.getAccount = (req,res)=>{

  res.status(200).set( 'Content-Security-Policy',
  "script-src 'self' https://cdnjs.cloudflare.com/ajax/libs/axios/1.3.3/axios.min.js 'unsafe-inline' 'unsafe-eval';"
  ).render('account',{
    title:'Your Account'
  })

}


exports.getUserUpdate = catchAsync(async ( req, res, next) => {
  const update = await User.findByIdAndUpdate(
    req.user.id,{
    
     name :  req.body.name,
     email: req.body.email
    },
    {
      new:true,
      runValidators:true 
 
    }
    
  );
  

 res.status(200).render('account',{
  title:'Your Account',
  user: update  
 });
 
});