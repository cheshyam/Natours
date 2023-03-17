const express = require('express'); 
const path = require('path');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const globalErrorHandle = require('./controller/Errorcontroller');
const tourRouter = require('./router/TourRouter');
const userRouter = require('./router/UserRouter');
const reviewRouter = require('./router/reviewRouter');
const bookingRoutes = require('./router/bookingRouter');
const viewRouter = require('./router/viewRouter');

const app = express();
app.set('view engine','pug');
app.set('views',path.join(__dirname,'views'));



//2.MIDDELWARE
// serving test file
app.use(express.static(path.join(__dirname,'public')));
app.use(helmet());
app.use(cookieParser());

app.use(mongoSanitize());

app.use(xss());

app.use(hpp({
  whitelist:['duration','ratingAverage','ratingQuantity','difficulty','price']}
))

if(process.env.NODE_ENV ===  'development') {
    app.use(morgan('dev'));
}
const limiter = rateLimit({
 max:100,
 windowMs:60*60*1000,
 message:'too many request in Ip address please wailt in 1 hour!'
});


app.use('/api',limiter);
app.use(express.json({limit:'10kb'}));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(express.json());


// test middleware
app.use((req,res,next)=>
{
    req.requestTime = new Date().toISOString();
    next();
    // console.log(req.cookies);
});
  
//3 ROUTES
app.use('/',viewRouter);
app.use('/api/v1/tours',tourRouter);
app.use('/api/v1/user',userRouter);
app.use('/api/v1/reviews',reviewRouter);
app.use('/api/v1/booking',bookingRoutes);

app.use('*', (err, req, res, next) => {
    res.status(err.statusCode).json({
        status: err.statusCode,
        message: err.message
    })
});
app.use(globalErrorHandle);

module.exports = app;