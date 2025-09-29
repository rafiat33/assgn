const joi = require('joi');

exports.signUpValidator = async(req, res, next)=> {
const schema = Joi.object({
    
    firstName:Joi.string().min(3).max(30).pattern(new RegExp('^[A-Za-z]+$')).
    required().messages({
    'any.required': 'Firstname is required.',
    'string.empty':'FirstName is required.',
    "string.min":"FirstName should contain at least 3 characters.",
    "string.max":"FirstName should not be more than 30 characters long.",
    "string.pattern.base": "FirstName can only contain letters, with no spaces"
}),
    LastName:Joi.string().min(3).max(30).pattern(new RegExp('^[A-Za-z]+$')).
    required().messages({
    'any.required':'Lastname is required.',
    'string.empty':'LastName cannot be empty required.',
    "string.min":"LastName should contain at least 3 characters.",
    "string.max":"LastName should not be more than 30 characters long.",
    "string.pattern.base": "LastName can only contain letters, with no spaces"
    }),
    
    email:Joi.string().email().required().messages({
    'any.required':'Email is required.',
    'string.empty': 'Email cannot be empty required.',
    "string.email":"Invalid email format.",
    }),

    password: Joi.string().pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$')).
    required().message({
        'any required':"Password is required.",
        "string.empty":"Password cannot be empty",
        "string.pattern.base":'Password must be at least 8 characters long,contain at least one Uppercase, Digits and a special character*[@$!%*?&}'
    })
})

const { error } = schema.validate(req.body)
if(error) {
    return res.status(400).json({
        message: error.details[0].message
    })
}
next()
}

exports.loginValidator = async(req, res, next) =>{
    const schema = Joi.object({
    email:Joi.string().email().required().messages({
    'any.required':'Email is required.',
    'string.empty': 'Email cannot be empty required.',
    "string.email":"Invalid email format.",
    }),
    password: Joi.string().required().message({
        'any.required':"Password is required.",
        'string.empty':"Password cannot be empty",
    })
    })

    const{error} = schema.validate(req.body);
    if(error){
        return res.status(400).json({
            message:error.details[0].message
        })
    }
}