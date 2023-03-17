/* eslint-disable */
const crypto = require('crypto');
const {promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const Email = require('../utils/email');
const AppError = require('../utils/AppError');


const signToken = id => {
    return jwt.sign({ id },process.env.JWT_SECERTE,{
    expiresIn:process.env.JWT_EXPIERS_IN
  });
};
 
const createSendToken = (user,statusCode,res)=>{
  const token = signToken(user._id);
  const cookieOptions={
    expiers: new Date(
     Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly:true
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  
  res.cookie('jwt',token,cookieOptions)
  user.password =undefined;

  res.status(statusCode).json({
    status:'suceess',
    token,  
    data:{
      user
    }
 });
};

exports.signup = catchAsync( async (req,res,next) => {
  const newUser = await User.create(req.body);
  const url = `${req.protocol}://${req.get('host')}/me`;
  console.log(url);
  await new Email(newUser,url).sendWelcome();

  createSendToken(newUser,201||500,res);
    
});

exports.login = catchAsync(async(req,res,next)=>{
  const {email,password} = req.body;

  if(!email ||!password){
     return next(new AppError('please give me this real data!',400));
  }

  const user = await User.findOne({email}).select('+password');


  if(!user||!(await user.correctPassowrd(password,user.password))){
    return next(new AppError('please provided really username and password',401));
  }
    
  createSendToken(user,200,res);
    
});

exports.logout = (req,res)=>{
  res.cookie('jwt','loggedOut',{
    expires:new Date(Date.now() + 10 * 1000),
    httpOnly:true
  });
  res.status(200).json({ status: 'success' });
};

exports.protect = catchAsync(async (req,res,next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }
    
  const decode = await promisify(jwt.verify)(token, process.env.JWT_SECERTE);

  if(!decode){
    return next(new AppError('Token is expired or invalid',401))
  };
 
  const currentUser =await User.findById(decode.id);
  if(!currentUser){
    return next(new AppError('please provided validation id',401))
  };
  if (currentUser.changedPasswordAfter(decode.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    );
  }
  req.user= currentUser;  
  res.locals.user= currentUser;  
  next();
});


exports.isLoggedIn = async (req,res,next) => {
  if (req.cookies.jwt) {
    try{
      const decode = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECERTE);

      const currentUser =await User.findById(decode.id);
      if (!currentUser){
        return next();
      }
      if (currentUser.changedPasswordAfter(decode.iat)) {
        return next();
      } 

      res.locals.user= currentUser;  
      return next();
    } catch(err){
      return next();
    }
  } 
  next(); 
};

 

exports.restrictTo = (...roles) =>{
 return (req, res, next) => {
    // roles ['admin', 'lead-guide']. role='user'
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    
  next();
 }
};

exports.forgotPassword = catchAsync (async(req,res,next)=>{
 //  1.Get based posted email
 const user = await User.findOne({email:req.body.email})

 if(!user){
    return next(new AppError('There is not used email adderss'),404)
 }
 // 2.generated the random reset token
 const resetToken = user.createPasswordResetToken();
 await user.save({ validateBeforeSave:false });


 // 3.send it to user's email
 const resetURL =`${req.protocol}://${req.get('host')}/api/v1/user/resetPassword/${resetToken}`;



 try{
    // await sendEmail({
    //   email: user.email,
    //   subject: 'Your password reset token (valid for 10 min)',
    //   message
    // });
    await new Email(user,resetURL).sendResetPassword()
    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!'
    });
 }catch(err) {
 user.passwordResetToken = undefined;
 user.passwordResetExpires = undefined;
 await user.save({ validateBeforeSave: false });

 return next(
      new AppError('There was an error sending the email. Try again later!',500)
     
    );
 }
});


exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto 
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) Update changedPasswordAt property for the user
  // 4) Log the user in, send JWT
  createSendToken(user, 200, res);
}); 


exports.updatePassword = catchAsync(async(req,res,next)=>{
  const user = await User.findById(req.user.id).select('+password');

  if (!await user.correctPassword(req.body.passwordCurrent, user.password)){
    return next(new AppError('your vaild for current password',400))
  };

  user.password=req.body.password;
  user.passwordConfirm=req.bosy.passwordConfirm;
  await user.save();

  createSendToken(user,200,res);

});
