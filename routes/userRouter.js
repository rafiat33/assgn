const router = require('express').Router();
const{ signUp, verifyUser, resendVerification ,login, forgotPassword,resetPassword,getAll,changePassword} =  require("../controller/userController");
const {authenticate} =require('../middleware/authentication');
const { signUpValidator, loginValidator } = require('../middleware/validator');
router.post('/users',signUpValidator , signUp);

router.post('/users',loginValidator,login)
//router.post('/signup', signUpController);
router.get('/users/verify/:token',verifyUser);

router.post('/users/resend-verification',resendVerification);

router.post('/users/login',login);

router.post('/users/forgot/password', forgotPassword);

router.post('/users/reset/password/:token', resetPassword);

//router.post('/users/change/password:token', changePassword)
router.get('/users/',authenticate, getAll);

router.patch('/users/change/password',authenticate,changePassword);

module.exports = router;