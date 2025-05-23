const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

//api/v1/users
router.route('/signup').post(authController.signup);
router.route('/login').post(authController.login);
router.route('/logout').get(authController.logout);

router.route('/forgotPassword').post(authController.forgotPassword);
router.route('/resetPassword/:token').patch(authController.resetPassword);

// Only logged in user can access the routes below
router.use(authController.protect);
router.route('/updateMyPassword').patch(authController.updateMyPassword);
router
  .route('/updateMe')
  .patch(userController.uploadImageUser, userController.updateMe);
router.route('/deleteMe').delete(userController.deleteMe);
router.route('/me').get(userController.getMe, userController.getUser);

// Only admin and manager can access the routes below
router.use(authController.inRole('admin', 'manager'));
router.route('/').get(userController.getAllUsers);
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);
module.exports = router;
