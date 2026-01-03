const exress = require('express')

const router = exress.Router()

const authController = require('../controllers/auth')

const { check, body } = require('express-validator')
const User = require('../models/user')

router.get('/login', authController.getLogin)

router.post('/login',
  [ check ('email').isEmail().withMessage('Please enter a valid email').bail(),

    body('password', 'Please enter a valid password only number and text not less then 5 characters')
      .isLength({min: 5})
      .isAlphanumeric(),

  ]
  ,authController.postLogin
)

router.post('/logout', authController.postLogout)

router.get('/signup', authController.getSignup)

router.post('/signup',
   [ check ('email').isEmail().withMessage('Please enter a valid email').bail()
    .custom((value, { req }) => {
      // if(value === 'test@test.com'){
      //   throw new Error('Email is not allowed')
      // }
      // return true;

      return User.findOne({email: value}).then(userDoc => {
        if(userDoc){
          return Promise.reject('Email already exist. Kindly provide another one.')
        }
      })
    }),
    body('password', 'Please enter a valid password only number and text not less then 5 characters')
      .isLength({min: 5})
      .isAlphanumeric(),

    body('confirmPassword').custom((value, { req }) => {
      if(value !== req.body.password){
        throw new Error('Password must match')
      }
      return true;
    })
  ],

  authController.postSignup)

router.get('/reset', authController.getReset)

router.post('/reset', authController.postReset)

router.get('/reset/:resetToken', authController.getNewPassword)

router.post('/reset/new-password', authController.postNewPassword)


module.exports = router;
