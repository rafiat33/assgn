const router = require('express').Router();
const{ signUp, verifyUser, resendVerification ,login, forgotPassword,resetPassword,changePassword} =  require("../controller/userController");

router.post('/users', signUp);
//router.post('/signup', signUpController);
router.get('/users/verify/:token',verifyUser)

router.post('/users/resend-verification',resendVerification)

router.post('/users/login',login)

router.post('/users/forget/password', forgotPassword)

router.post('/users/reset/password:token', resetPassword)

router.post('/users/change/password:token', changePassword)


module.exports = router;