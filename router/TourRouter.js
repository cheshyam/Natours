const express = require('express');
const authController = require('../controller/authController');
const tourController = require('../controller/tourController');
const reviewRouter = require('./reviewRouter');


const router = express.Router();
router.use('/:tourId/reviews',reviewRouter);
router.route('/top-5-cheap').get(tourController.aliasTopTours, tourController.getAllTour);
router.route('/tour-stats').get(tourController.getTourState);
router.route('/monthly-plan/:year').get(tourController.getmonthlyplan);
router
.route('/tours-Within/:distance/center/:latlng/unit/:unit')
.get(tourController.getToursWithin);
router.route('/distance/:latlng/unit/:unit')
.get(tourController.getDistances);



//  router.param('id',tourController.checkID);
router
.route('/')
.get( authController.protect, tourController.getAllTour)
.post(tourController.createTour);



router
.route('/:id')
.get(tourController.getTour)
.patch(
    authController.protect,
    tourController.uploadTourPhoto,
    tourController.resetImageSize,
    tourController.updateTour
)
.delete(authController.protect,tourController.deleteTour);


// router
// .route('/:tourId/reviews')
// .post(authController.protect,
//     authController.restrictTo('user'),
//     reviewController.createReview
// );


module.exports = router;

