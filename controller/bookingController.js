const stripe =require('stripe')(process.env.SCRIPT_SECERT_KEY)
const Tour = require('../models/tourmodel');
const catchAsync = require('../utils/catchAsync');
// const AppError = require('../utils/AppError');



exports.getCheckoutSession=catchAsync(async(req,res,next)=>{
 //1.create user find   
 
 const tour =  await Tour.findById(req.params.tourId);
    // console.log(tour);
 // 2.checkout session user
 const transformedItems = [
    {
      quantity: 1,
      price_data: {
        currency: 'INR',
        unit_amount: tour.price * 100,
        product_data: {
          name: `${tour.name} Tour`,
          description: tour.summary,
          images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
        },
      },
    },
  ];
 
  const session = await stripe.checkout.sessions.create({
    expand: ['line_items'],
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/`,
    cancel_url: `${req.protocol}://${req.get('host')}/tours`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,

    line_items: transformedItems,

    mode: 'payment',
  });
  // console.log(session)
 //3. client send responsed
   res.status(201).json({
     status:'success',
     session
   }) 
   console.log("session") 
})