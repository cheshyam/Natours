const express = require('express');
const reviewController = require('../controller/reviewController');
const authController = require('../controller/authController');  

const router = express.Router({mergeParams:true});

router.use(authController.protect);
router.route('/')
.get(reviewController.getAllreview)
.post(authController.protect,reviewController.createReview);

router.route('/:id')
.get(authController.protect,reviewController.getReview) 
.patch(authController.protect,reviewController.updateReview)
.delete(reviewController.deleteReview);


module.exports = router;