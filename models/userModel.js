const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator'); 
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:{
    type:String,
    required:[true,'please tell your name'],
    
  },
  email:{
    type:String,
    lowercase:true,
    required:[true,'please provide your email'],
    unique:true,
    validate: [validator.isEmail, 'please provided reall email adders']
  },
  photo: {
    type:String, default:'default.jpg'
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user'
  },
  password: {
    type:String,
    required:true,
    minilength:8,
    unique:true,
    select :false

  },
  passwordconfirm:{
    type:String,
    required:true,
    validate :{
      validator:function(el){
         return el===this.password;
        },
      message:'please enter same password' 
    }
  },
  passwordChangedAt : Date,
  passwordResetToken : String,
  passwordResetExpiers : Date,
  active:{
    type:Boolean,
    default:true,
    select:false
  }
});

userSchema.pre('save',async function(next){
  if(!this.isModified('password')) return next();

  this.password= await bcrypt.hash(this.password,12);
  
 this.passwordconfirm= undefined;
 next();
});

userSchema.pre('save',function(next){
 if(this.isModified('password')||this.isNew)return next();

 this.passwordChangedAt = Date.now()-1000;
 next();
}); 

userSchema.pre(/^find/,function(next) {
  this.find({active:{$ne:false}})
  next();
});

userSchema.methods.correctPassowrd= async function(candidatePassword, userPassword){
  return await  bcrypt.compare(candidatePassword,userPassword);
};

userSchema.methods.changedPasswordAfter =  function(JWTTimpstamp){
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimpstamp < changedTimestamp;
  }

  // False means NOT changed
  return false;
}


userSchema.methods.createPasswordResetToken = function(){
  const resetToken= crypto.randomBytes(32).toString('hex');

  this.passwordResetToken=crypto
  .createHash('sha256')
  .update(resetToken)
  .digest('hex');
  
  console.log({ resetToken },this.PasswordResetToken);

 this.passwordResetExpiers= Date.now() +10 * 60 * 1000;

 return resetToken; 

};

const  User = mongoose.model('User',userSchema);

module.exports = User;