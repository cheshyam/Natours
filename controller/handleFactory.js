const catchAsync = require('../utils/catchAsync');
const AppError =  require('../utils/AppError');
const APIFeatures  = require('../utils/ApiFeacture');


exports.deleteOne = model=> catchAsync(async(req,res,next)=>{
    const doc= await model.findByIdAndDelete(req.params.id);
    if (!doc) {
     return next(new AppError('No tour found with that ID', 404));
   }
    res.status(204).json({
      status:"success",
      data: null
    });
  } 
);

exports.updateOne = model=> catchAsync(async(req,res,next)=>{
  const doc = await model.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!doc) {
    return next(new AppError('No document found with that ID', 404));
  }
  res.status(200).json({
      status:"success",
      data:{
        data: doc
      }
    })
  }
);


exports.createOne = model=>catchAsync (async (req, res,next) => {
 
    // const newTour = new Tour({})
    // newTour.save()

 const doc = await model.create(req.body);

res.status(201).json({
    status:'succes',
    data:{
     data : doc
    }
});
});


exports.getOne = (model,popOptions)=>catchAsync(async (req,res,next)=>{
    let query;
    if(!model.findById(req.params.id)) query = query.populate(popOptions);
    const doc = await query;
   
    if (!doc) {
        return next(new AppError('No tour found with that ID', 404));
    }
    res.status(200).json({
     status:'succes',
     data:{
        data: doc       
     }
    });

});

exports.getAll= model=>catchAsync(async (req,res,next)=>{
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

   const features = new APIFeatures(model.find(filter).populate('guides'), req.query)
     .filter()
     .sort()
     .limitFields()
     .paginate();
    const doc = await features.query;
      res.status(200).json({
      status:'succes',
      results: doc.length,
       data:{
        data:doc
      } 
    });
});