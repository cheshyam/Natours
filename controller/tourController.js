const multer = require('multer');
const sharp = require('sharp');
const Tour = require('../models/tourmodel');
const catchAsync = require('../utils/catchAsync');
// const APIFeatures = require('../utils/ApiFeacture');
const AppError = require('../utils/AppError');
const factory = require('./handleFactory');

exports.aliasTopTours = (req,res,next)=>{
  req.query.limit = '3';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,,ratingaverage,difficulty,summary';
  next();
};


const multipleStorage = multer.memoryStorage();

const filterStorage = (req,file,cb)=>{
  if(file.mimetype.startsWith('image')){
    cb(null,true);
  }else{
    cb(new AppError('not a image can upload to this image',404),false);
  }


    
};
 
const upload = multer({ storage:multipleStorage,fileFilter:filterStorage});

exports.uploadTourPhoto = upload.fields([
  {name:'imageCover',maxCount:1},
  {name:'images',maxCount:3}
]);




exports.resetImageSize=catchAsync(async(req,res,next)=>{
  if(!req.files.imageCover || !req.files.images) return next();
 // 1. cover image  
  req.body.imageCover= `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000,1333)
    .toFormat('jpeg')
    .jpeg({quality:90})
    .toFile(`public/img/tours/${req.body.imageCover}`);

  // 2. images
  req.body.images = [];

  
  await Promise.all(
   req.files.images.map(async(file,i)=>{
     const filename = `tour-${req.params.id}-${Date.now()}-${i+1}.jpeg`; 
     await sharp(file.buffer)
        .resize(2000,1333)
        .toFormat('jpeg')
        .jpeg({quality:90})
        .toFile(`public/img/tours/${filename}`);
      req.body.images.push(filename);  
    })

  );


  next();
});

// exports.getAllTour = catchAsync(async (req,res,next)=>{
//             // console.log(req.query);

//       //  // 1A.filter
//       //  const queryObj = { ...req.query };
//       //  const excludeFields= ['page','sort','limit','fields'];
//       //  excludeFields.forEach(el => delete queryObj[el]);
     
//       //  //1B. advance filter
//       //  let querystr=JSON.stringify(queryObj);
//       //  querystr = querystr.replace(/\b(gte|gt|lte|lt)\b/g,match => `$${match}`);
//       //  let query = Tour.find(JSON.parse(querystr));
       

//       //  //2.sorting
    
//       //   if(req.query.sort){
//       //   const sortBy = req.query.sort.split(',').join(' ');
//       //   query =query.sort(sortBy);
//       //  }else{
//       //    query = query.sort('-createAt');
//       //  }

//       //  //3. limting 
//       //  if(req.query.fields){
//       //  const fields = req.query.fields.split(',').join(' ');
//       //  query = query.select(fields); 
//       //  } else{
//       //       query = query.select('-__v');
//       //   }
     
//       //  //4. paggination
      
//       //   const page = req.query.page *1||1;
//       //   const limit = req.query.limit *1 ||100;
//       //   const skip =  (page - 1) * limit;
       
//       //   query = query.skip(skip).limit(limit);   
         
//       //   if(req.query.page){
//       //     const numTours = await tour.countDocuments();
//       //     if(skip > numTours) throw new Error ('This page not found');
//       //   }
//   const features = new APIFeatures(Tour.find().populate('guides'), req.query)
//    .filter()
//    .sort()
//    .limitFields()
//    .paginate();
//   const tours = await features.query;
//   // console.log(tours);
//         //   const query = Tour.find().where('difficulty').equal('easy').where('duration').equal('4'); 
   
//        // const tour = await query;
//        // const tour = await Tour.find({
//        //   duration:5,
//        //   difficulty:'easy'
//        // });

//   res.status(200).json({
//    status:'succes',
//    results: tours.length,
//    data:{
//       tours
//     } 
//   });
// }); 
   


// exports.getTour =catchAsync(async (req,res,next)=>{
//       const tour = await Tour.findById(req.params.id);
//       if (!tour) {
//           return next(new AppError('No tour found with that ID', 404));
//       }
//       res.status(200).json({
//       status:'succes',
//       data:{
//              tour       
//       }
//     })

//   } 
// )


exports.getAllTour = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, {parth:'Review' });
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour= factory.deleteOne(Tour);


// exports.deleteTour = catchAsync(async(req,res,next)=>{
//      const tour= await Tour.findByIdAndDelete(req.params.id);
//      if (!tour) {
//       return next(new AppError('No tour found with that ID', 404));
//     }
//         res.status(204).json({
//             status:"success",
//             data: null
//           });
//     } 
// )
exports.getTourState = catchAsync( async (req,res,next)=>{
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } }
      },
      {
        $group: {
          _id: { $toUpper: '$difficulty' },
          numTours: { $sum: 1 },
          numRatings: { $sum: '$ratingsQuantity' },
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' }
        }
      },
      {
        $sort: { avgPrice: 1 }
      }
      // {
      //   $match: { _id: { $ne: 'EASY' } }
      // }
    ]);
     res.status(200).json({
      status: 'success',
      data: {
        stats
      }
    });

  }
);

exports.getmonthlyplan = catchAsync(async(req,res,next)=>{
   const year = req.params.year * 1;
   const plan = await Tour.aggregate([
    {
      $unwind : `$startDates`
    },
    {
      $group:{
        startDates :{
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' }
      }
    },
    {
      $addFields: { month: '$_id' }
    },
    {
      $project: {
        _id: 0
      }
    },
    {
      $sort: { numTourStarts: -1 }
    },
    {
      $limit: 12
    }
  ]);

   res.status(200).json({
    status: 'success',
    data: {
      plan
    }
   })


   }
)


exports.getToursWithin = catchAsync(async(req,res,next)=>{
 const { distance , latlng , unit } =  req.params;
 const [lat, lng] = latlng.split(',');
 
  const radius = unit ==='mi'?distance/3963.2:distance/6378.1;

 if( !lat || !lng ){
    next( new AppError( ' please provied this distance and lating ' , 400 ) );
  };

  const tours = await Tour.find({
   startLocation:{ $geoWithin:{ $centerSphere: [[lng, lat], radius] } }
  }); 
  
 console.log(distance,lat,lng,unit);
 res.status(201).json({
  status:'sucess',
  results:tours.length,
  data:{
         data :tours
  }
 })
});

exports.getDistances = catchAsync(async(req,res,next)=>{
 const { latlng , unit } =  req.params;
 const [lat, lng] = latlng.split(',');

 const multiplier = unit ==='mi'?0.000621371 : 0.001;

 if( !lat || !lng ){
    next( new AppError( ' please provied this distance and lating ' , 400 ) );
 };
  
 const distances = await Tour.aggregate([
   {
     $geoNear:{
      near:{
        type:'point',
        coordinates: [lng * 1,lat * 1]
      },
      distanceField:'distance',
      distanceMultiplier:multiplier
     }
   },
   {
    $project:{
      distance:1,
      name:1
    }
  }
 ]);
 
 res.status(201).json({
    status:'sucess',
    data:{
           data :distances
    }
 })
})