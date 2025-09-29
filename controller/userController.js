const userModel =require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const{ signUPTemplate, } = require('../utils/emailTemplate')
const emailSender = require('../middleware/nodemailer')
const {verificationTemplate} = require('../utils/emailTemplate');
const {resetPasswordTemplate} =require('../utils/emailTemplate')
//const{changePasswordTemplate}=require('../utils/emailTemplate')

const { options } = require('../routes/userRouter');
const { authenticate } = require('../middleware/authentication');
exports.signUp = async(req, res) =>{
    try{
        const { firstName, lastName, password, email} = req.body;
        const userExists = await userModel.findOne({email:email.toLowerCase()});
   if(userExists) {
     return res.status(404).json({
        message: 'User already exists'
     })
    }
    const saltedRounds = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password,saltedRounds)

    const user = new  userModel({
        firstName,
        lastName,
        email: email.toLowerCase(),
        password: hashedPassword,
    
    });

    await user.save()
  console.log(user)
    
    const token = jwt.sign({
       id:user._id,
       email:user.email
    }, process.env.JWT_SECRET,{ expiresIn: '1H'});
    const link =`${req.protocol}://${req.get('host')}/users/verify/${token}`
    console.log('link:', link)


    const emailOption = {
        email: user.email,
        subject:"Graduation Note",
        html: signUPTemplate(link,user.firstName)
    }

    await emailSender(emailOption);
    return res.status(201).json({
        message:'User registered successfully',
        data: user
    })
    
    }catch(error){
        return res.status(500).json({
            message:error.message
        })

    }
}

exports.verifyUser = async(req, res) =>{
    try{
        const {token} = req.params;
        if(!token){
            return res.status(404).json({
                message: 'token not found'
            })
        }
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    console.log(decoded)
    const user = await userModel.findById(decoded.id)
    if(!user) {
        return res.status(404).json({
            message:'user not found'
        })
    }
    if(user.isVerified) {
        return res.status(400).json({
            message: 'user already verified, Please proceed to login'
        })
    }
    user.isVerified = true;
    await user.save()
    res.status(200).json({
        message: "user verified successfully"
    })
    } catch(error){
    
      // to change the message pop up to the  client
      if(error===jwt.TokenExpiredError){
        return res.status(500).json({
          message:"Session expired,please resend verification"
        })

      }
        return res.status(500).json({
            message:error.message
        })
    }
}

exports.resendVerification = async(req, res) =>{
  try{
    const {email} = req.body;
    const user = await userModel.findOne({email: email.toLowerCase()});
    if(!user){
      return res.status(404).json({
        message:"user not found"
      
      });

    }
    // throw a message if the user has already being verified 
    if(user.isVerified) {
      return res.status(400).json({
        message:"User already verified, Please proceed to login"
      })
    }
    //Generate a new token
    const token = jwt.sign({
      email: user.email,
      id: user._id

    }, process.env.JWT_SECRET, {expiresIn: "30mins"});

    const link = `${req.protocol};//${req.get('host')}/users/verify/${token}`
    const options = {
      email: user.email,
      subject:'Verification Email',
      html: verificationTemplate(link,user,firstName)
    }

    await email.save()
  }catch(error){
res.status(500).json({
  message:error.message
})
  }
}


exports.login = async(req, res) =>{
  try{
    //Extract the required fields
    const{ email, password} = req.body;
    // find the user with the email and check if the user exists
    if(!user){
      return res.status(404).json({
        message: "user not found"
        
      })
    }
    //Check if the password is correct
    const passwordCorrect = await bcrypt.compare(password, user.password);
    if(!password ===  false) {
      return res.status(400).jso({
        message:"Incorrect Password"
      })
    }
    if(user.isVerified === false){
      return res.status(401).json({
        message: "User not verified,Please check your email for verification"
      })
    }

    //Generate a token for the user
    const token = jwt.sign({
      email: email.email,
      id: user_id,
    },process.env.JWT_SECRET,{expiresIn: '1hr'});

    //Send a sucess response
    res.status(200).json({
      message:"login successful",
      data:user
    })

  }catch(error){
    return res.status(500).json({
      message:error.message
    })
  }
}


// exports.forgotPassword =async(req, res) =>{
//   try{
//     const {email} =req.body;
//     //find the user with the email 
//     const user = await userModel.findOne({email:email.toLowerCase()});
//     if(!user){
//       return res.status(400).json({
//         message:"User not found"
//       })
//     }

//     //Generate a token and a link
//     const token = jwt.sign({
//       email: user.email,
//       id:user._id
      
//     },process.env.JWT_SECRET,{expiresIn: '10mins'});
//     const link = `${req.protocol}://${req.get('host')}/users/reset/password/${token}`
   
//     //create email options
//     const option= {
//       email: user.email,
//       subject: "Reset Password",
//       html: resetPasswordTemplate(link,user,firstName)
//     }
//   // send the email to the user
//     await emailSender(options)

//       //send a sucess response
//       resturn.res(200).json({
//         message:"Request password request is sucessful"
//       })
    
//   } catch(error){
//     res.status(500).json({
//       message: error.message
//     })
//   }
// }


exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Find the user with the email
    const user = await userModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({
        message: "User not found"
      });
    }

    // Generate a token and a link
    const token = jwt.sign(
      {
        email: user.email,
        id: user._id
      },
      process.env.JWT_SECRET,
      { expiresIn: '10min' } // use '10m' instead of '10mins'
    );

    const link = `${req.protocol}://${req.get('host')}/users/reset/password/${token}`;

    // Create email options
    const options = {
      email: user.email,
      subject: "Reset Password",
      html: resetPasswordTemplate(link, user, user.firstName)
    };

    // Send the email
    await emailSender(options);

    // Send a success response
    return res.status(200).json({
      message: "Password reset request successful. Please check your email."
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};
//const jwt = require('jsonwebtoken');
//const bcrypt = require('bcryptjs');
//const userModel = require('../models/userModel'); // Make sure this is the correct path


//update
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match",
      });
    }

    // Verify the token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return res.status(400).json({
          message: "Link expired, please request a new link",
        });
      }
      return res.status(400).json({
        message: "Invalid or malformed token",
      });
    }

    // Find user by ID from decoded token
    const user = await userModel.findById(decoded.id);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({
      message: "Password reset successful",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

//class
// exports.resetPassword = async(req, res) =>{
//   try{
//     //Get the token from the params
//     const{token} = req.params;
//     // Extract the passwords from the request body
//     const {newPassword, confirmPassword} = req.body;
//     if(newPassword !== confirmPassword){
//       return res.status(400).json({
//         message:"User not found"
//       })
//     }
//     // Encryt the new password
//     const salt = await bcrypt.genSalt(10)
//     const hashedPassword = await bcrypt.hash(newPassword,salt);

//  //update the user password to the new pasword
//     user.password = newPassword
//     await user.save()
//     const decoded = jwt.verify('token,process.env.JWT_SECRET')
//     //find the user decoded
//     const user = await userModel.findOne(decoded.id)
//   }catch(error){
//     if(error instanceof jwt.TokenExpiredError)
//       return res.status(400).json({
//     message: "link expired, please request a new link"
//     })
//     res.status(500).json({
//       message:error.message
//     })
//   }
// }





// exports.changePassword = async (req, res) => {
//   try {
//     const { token } = req.params;
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     const user = await userModel.findById(decoded.id); // Fix here
//     if (!user) {
//       return res.status(400).json({
//         message: "User not found",
//       });
//     }

//     const { oldPassword, newPassword } = req.body;

//     // Optional: Check if old password matches
//     const isMatch = await bcrypt.compare(oldPassword, user.password);
//     if (!isMatch) {
//       return res.status(400).json({
//         message: "Old password is incorrect",
//       });
//     }

//     // Hash the new password
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(newPassword, salt);

//     // Save the new password
//     user.password = hashedPassword;
//     await user.save();
//     //create email option


//     return res.status(200).json({
//       message: "Password changed successfully",
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: error.message,
//     });
//   }
// };


exports.getAll = async(req,res) =>{
  try{
    const users = await userModel.find()
      res.status(200).json({
        message: "All users retrieved"
      })
    }catch(error){
      res.status(500).json({
        message:error.message
      })
    }
  }

  exports.changePassword = async (req, res) =>{
    try{
      const userid = req.user.Id;
      const {oldPassword, newPassword, confirmPassword} = req.body;
      const user = await userModel.findById(userid)
      if(!user){
        return res.status(404).json({
          message:"User not found"
        })
      }
if(newPassword!== confirmPassword){
  return res.status(400).json({
    message: "Password does not match"
  })
}
const passwordCorrect = await bcrypt.compare(oldPassword,user.password)
if(!passwordCorrect){
  return res.status(400).json({
    message: "Old password incorrect"
  })
}
const salt = await bcrypt.genSalt(10)
const hashedPassword = await bcrypt.hash(newPassword, salt)

user.password = hashedPassword
 await user.save()

 res.status(200).json({
  message:"password updated successfully"
 })
    }catch(error){
      res.status(500).json({
        message: error.message
      })
    }
  }


//  const saltedRounds= 10;

//  bcrypt.genSalt(saltedRounds, function(err, salt) {
//   console.log("Generated Salt:",salt);
//  })
//   bcrypt.hash("mypassword123", salt, function(err, hash) {
//     console.log("Hashed password:",hash);
//   });
//  });


// async function hashedPassword(password) {
//   const salt= await bcrypt.genSalt(12);
//   const hash = await bcrypt.hash(password, salt);
//   return hash;

// }
  
// hashedPassword("Supersecure").then(console.log);


// 


// console.log(token)