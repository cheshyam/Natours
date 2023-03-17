const mongoose = require('mongoose');
const Tour = require('./tourmodel');
// const Tour = require('./tourModel');
const reviewSchema = new mongoose.Schema({
   review:{
    type:String,
    require:[true,'this review are belong to tour']

   },
   rating:{
    type:Number,
    min:1,
    max:5
   },
   createdAt:{
    type: Date,
    default:Date.now
   },
   tour:{
    type:mongoose.Schema.ObjectId,
    ref:'Tour',
    required:[true,'Tour review are belong']
   },
   user:{
    type:mongoose.Schema.ObjectId,
    ref:'User',
    required:[true,'User are can given review for Tour']
   }
}, 
{
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });
reviewSchema.pre(/^find/,function(next){

  this.populate({
    path:'user',
    select:'name photo'
  });
 next();
});

reviewSchema.statics.calcAverageRating = async function(tourId){
  const rating = await this.aggregate([
    {
      $match : {tour: tourId}
    },
    {
      $group:{
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);
  // console.log(rating);
  if(rating.length>0){
    await Tour.findByIdAndUpdate(tourId,{
      ratingsQuantity:rating[0].nRating,
      ratingsAverage:rating[0].avgRating
    });
  }else{
         await Tour.findByIdAndUpdate(tourId, {
         ratingsQuantity: 0,
        ratingsAverage: 4.5
    });
  }
};

reviewSchema.post('save', async function(){
  
  this.constructor.calcAverageRating(this.tour)
  
});

reviewSchema.pre(/^findOneAnd/, async function(next){
  this.r = await this.findOne();
  next(); 
  
});

reviewSchema.post(/^findOneAnd/,async function(){
  await this.r.constructor.calcAverageRating(this.r.tour)

});


const Review = mongoose.model('Review',reviewSchema);


module.exports = Review;