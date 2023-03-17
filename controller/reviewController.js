const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handleFactory');


// exports.getAllreview = catchAsync(async(req,res,next)=>{
//  let filter = {}; 
//  if(req.params.tourId) filter = { tour:req.params.tourId };
//  const reviews = await Review.find(filter);

//  res.status(200).json({
//         status:'success',
//         results:reviews.length,
//         data:{
//             reviews
//         }
//  });
// });
exports.getAllreview = factory.getAll(Review);

exports.getReview = factory.getOne(Review);

exports.createReview = catchAsync(async(req,res,next)=>{

 if(!req.body.tour) req.body.tour = req.params.tourId;
 if(!req.body.user) req.body.user  =req.user.id;
 const newReview = await Review.create(req.body);

    res.status(201).json({
        status:'success',
        data:{
         review: newReview
        }
    });
});


exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);