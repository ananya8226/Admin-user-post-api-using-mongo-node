const Joi = require('joi')

// const login = Joi.object({
//   email: Joi.string().required(),
//   password: Joi.string().required(),
//   device_token: Joi.string().required(),
//   device_id: Joi.string().required(),
//   device_type: Joi.string().default('web').optional()
// });

// validation schema for login
const loginSchema = Joi.object({
  email: Joi.string().email().required()
    .messages({
      'string.base': 'Email should be a valid string.',
      'string.email': 'Please enter a valid email address.',
      'any.required': 'Email is required.'
    }),
  password: Joi.string().min(6).max(10).required()
    .messages({
      'string.base': 'Password should be a valid string.',
      'string.min': 'Password must be at least 6 characters long.',
      'string.max': 'Password cannot be longer than 10 characters',
      'any.required': 'Password is required.'
    })
})

// validation schema for signup
const signUpSchema = Joi.object({
  fullname: Joi.string().min(3).max(20).required()
    .messages({
      'string.base': 'Fullname should be a valid string.',
      'string.min': 'Fullname must be atleast 3 characters long',
      'string.max': 'Fullname cannot be longer than 20 characters',
      'any.required': 'Fullname is required'
    }),
  email: Joi.string().email().required()
    .messages({
      'string.base': 'Email should be a valid string.',
      'string.email': 'Please enter a valid email address.',
      'any.required': 'Email is required.'
    }),
  phone: Joi.string().pattern(/^[0-9]{10}$/).required()
    .messages({
      'string.base': 'Phone number should be a valid string.',
      'string.pattern.base': 'Please enter a valid 10-digit phone number.',
      'any.required': 'Phone number is required.'
    }),
  password: Joi.string().min(6).max(10).required()
    .messages({
      'string.base': 'Password should be a valid string.',
      'string.min': 'Password must be at least 6 characters long.',
      'string.max': 'Password cannot be longer than 10 characters',
      'any.required': 'Password is required.'
    }),
  profileImage: Joi.string()
  // .uri(),
    .messages({
      'string.base': 'Image URL should be a valid string.'
    // 'string.uri': 'Please provide a valid image URL.'
    })
})

// validation schema for post created by user
const postSchema = Joi.object({
  title: Joi.string()
    .min(3)
    .max(30)
    .required()
    .messages({
      'string.base': 'Title should be a valid string.',
      'string.min': 'Title must be at least 3 characters long.',
      'string.max': 'Title cannot be longer than 30 characters.',
      'any.required': 'Title is required.'
    }),

  image: Joi.string()
    // .uri()
    .messages({
      'string.base': 'Image URL should be a valid string.'
      // 'string.uri': 'Please provide a valid image URL.'
    })
})

// validation schema for change password
const changePasswordSchema = Joi.object({
  newPassword: Joi.string().min(6).max(10).required()
    .messages({
      'string.base': 'Password should be a valid string.',
      'string.min': 'Password must be at least 6 characters long.',
      'string.max': 'Password cannot be longer than 10 characters',
      'any.required': 'Password is required.'
    }),
  password: Joi.string().min(6).max(10).required()
    .messages({
      'string.base': 'Password should be a valid string.',
      'string.min': 'Password must be at least 6 characters long.',
      'string.max': 'Password cannot be longer than 10 characters',
      'any.required': 'Password is required.'
    })
}).with('password', 'newPassword')

// validation schema for reset password
const resetPasswordSchema = Joi.object({
  newPassword: Joi.string().min(6).max(10).required()
    .messages({
      'string.base': 'Password should be a valid string.',
      'string.min': 'Password must be at least 6 characters long.',
      'string.max': 'Password cannot be longer than 10 characters',
      'any.required': 'Password is required.'
    })
})

module.exports = {
  signUpSchema, loginSchema, postSchema, changePasswordSchema, resetPasswordSchema
}
