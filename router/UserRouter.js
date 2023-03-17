const express = require('express');

const userController = require('../controller/userController');
const authController= require('../controller/authController');



const router = express.Router();
router.post('/signup',authController.signup);
router.post('/login',authController.login);
router.get('/logout',authController.logout);
router.post('/forgotpassword',authController.forgotPassword);
router.post('/resetPassword/:token',authController.resetPassword);
router.get('/me',userController.getMe,userController.getUser);
router.use(authController.protect);
router.patch('/UpdateMyPassword',authController.updatePassword);

router.patch('/updateMe',userController.updateUserPhoto,
 userController.updateResizePhoto,
 userController.updateMe
);
router.delete('/deleteMe',userController.deleteMe);

router.use(authController.restrictTo('admin'));
router
 .route('/')
 .get(userController.getAllUser)
 .post(userController.createUser);

router
 .route('/:id')
 .get(userController.getUser)
 .patch(userController.updateUser)
 .delete(userController.deleteUser);


module.exports = router;
