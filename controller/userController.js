const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const factory = require('./handleFactory');

// const multipleStorage = multer.diskStorage({
//  destination:(req,file,cb)=>{
//     cb(null,'public/img/users');
//  },
//  filename:(req,file,cb)=>{
//     const ext = file.mimetype.split('/')[1];
//     cb(null,`user-${req.user.id}-${Date.now()}.${ext}`)
//  }


// })

const multipleStorage = multer.memoryStorage();

const filterStorage = (req,file,cb)=>{
  if(file.mimetype.startsWith('image')){
    cb(null,true);
  }else{
    cb(new AppError('not a image can upload to this image',404),false);
  }


    
};


const upload = multer({ storage:multipleStorage,fileFilter:filterStorage});


exports.updateUserPhoto = upload.single('photo');

exports.updateResizePhoto = catchAsync(async(req,res,next)=>{
 if(!req.file) return next();
   
 req.file.filename= `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
     .resize(500,500)
     .toFormat('jpeg')
     .jpeg({quality:90})
     .toFile(`public/img/users/${req.file.filename}`);
    next();

});


const filterObj = (obj, ...allowedFields) => {
 const newObj = {};
 Object.keys(obj).forEach(el => {
  if (allowedFields.includes(el)) newObj[el] = obj[el];
 });
 return newObj;
};

// exports.getAllUser =catchAsync(async(req,res,next)=>{
//     const users = await User.find();
//     res.status(200).json({
//         status:'succes',
//        results: users.length,
//         data:{
//            users
//     } 
//  })
// });
exports.getMe = (req,res,next)=>{
    req.params.id = req.user.id;
    next();
};


exports.updateMe= catchAsync(async(req,res,next)=>{

   
 if(req.body.password||req.body.passwordConfirm){
        return next(new AppError('This route are not passed.Please ude/updateMyPassword',400))
    };
    
 const filterBody = filterObj(req.body,'name','email');
 if(req.file) filterBody.photo = req.file.filename
 
 console.log(filterBody);
 const updateUser = await User.findByIdAndUpdate(req.user.id,filterBody,{
     new:true,
     runValidators:true
    });
    if (! updateUser) {
        res.status(404).json({
            status:'fail',
            message: "User not found"
        })
    }
    
    res.status(200).json({
        status:'success',
        data:{
            users:updateUser
        }
    })
    
});

exports.deleteMe = catchAsync(async(req,res,next)=>{
    await User.findByIdAndUpdate(req.user.id,{active:false})

    res.status(200).json({
        status:'succes',
        data: null
    })
})

exports.createUser = (req,res)=>{
    res.status(500).json({
        status:"error",
        message:"this routes is not defined"
    })
};

exports.getAllUser = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);

// exports.deleteUser =catchAsync(async(req,res,next)=>{
//     res.status(500).json({
//         status:"fail",
//         message:"page not found"
//     })
// })