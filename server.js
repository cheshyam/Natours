const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config ({path: './config.env'});

const app = require('./app');

const DB = process.env.DATABASE.replace('<PASSWORD>',process.env.DATABASE_PAASWORD);

mongoose.set('strictQuery', true);

mongoose.connect(DB,{
useNewUrlParser: true,
useCreateIndex:true,
useFindAndModify:false,
useUnifiedTopology:true 
}).then(() => console.log("DB is run successful"));

//  CREATE THE DATA
// const testTour= new Tour({
//     name : 'Abu',
//     price: 3000,
//     rating: 4.0
// });

// testTour.save().then(doc=>{
//     console.log(doc);
// }).catch(err=>{
//     console.log('ERROR',err);
// });

const port = process.env.PORT || 3000;
app.listen(port, ()=>{
    console.log(`app is runing in port ${port}`);
})