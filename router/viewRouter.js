const express = require('express');
const viewController = require('../controller/viewController');
const authController = require('../controller/authController');

const router = express.Router();




router.get('/', authController.isLoggedIn,viewController.getOverviews);
router.get('/tour/:slug',authController.isLoggedIn,viewController.getTour);
router.get('/login',authController.isLoggedIn,viewController.getLoginForm);
router.get('/me',authController.protect,viewController.getAccount);

router.post('/submit-user-data',authController.protect,viewController.getUserUpdate);

module.exports = router;