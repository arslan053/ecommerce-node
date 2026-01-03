const crypto = require("crypto")

const User = require("../models/user");
const bcrypt = require("bcryptjs")
const nodeMailer = require('nodemailer');
const sendGridTransport = require("nodemailer-sendgrid-transport");
const { validationResult } = require('express-validator')

const transporter = nodeMailer.createTransport(sendGridTransport({
  auth: {
    api_key: ''
  }
}))

exports.getLogin = (req, res, next) => {
  let message = req.flash('error')
  if (message.length > 0){
    message = message[0];
  } else {
    message = null
  }
  // console.log(req.get('Cookie'))
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    isAuthenticated: req.session.isLoggedIn,
    errorMessage: message,
    prevInput: {
      email: '',
      password: '',
      confirmPassword: ''
    },
    validationErrors: []
  })
}

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  const errors = validationResult(req);

  if(!errors.isEmpty()) {
    return res.status(422).render('auth/login', {
      path: '/login',
      pageTitle: 'Login',
      isAuthenticated: req.session.isLoggedIn,
      errorMessage: errors.array()[0].msg,
      prevInput: {email, password},
      validationErrors: [errors.array()]
    })
  }
  User.findOne({email: email})
  .then(user => {
    if(!user){
      // req.flash('error', 'Email or Password is not correct')
      // return res.redirect("/signup")   SO we have both approaches : we can also store value in session here to kepp the previous input and redirect Post/Redirect/Get (PRG) pattern.
      // and render with data (on refresh it resend post request )
      return res.status(422).render('auth/login', { // to keep the prev values user input  
        path: '/login',
        pageTitle: 'Login',
        isAuthenticated: req.session.isLoggedIn,
        errorMessage: 'Email or Password is incorrect',
        prevInput: {email, password},
        validationErrors: [{path: 'email'}, {path: 'password'}]
      })
    }
    bcrypt.compare(password, user.password)
      .then(isMatched => {
        if(!isMatched){
          req.flash('error', 'Email or Password is not correct') // we can use again the above res.render to keep the values but i will compromise here
          return res.redirect("/signup")
        }
        req.session.user = user
        req.session.isLoggedIn = true;
        return req.session.save(err => {
          res.redirect('/');
        })
      })
      .catch( err => {
        console.log(err)
      })

  })
  .catch(err => console.log(err));
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log('error', err)
    res.redirect('/')
  });
};

exports.getSignup = (req,res,next) => {

    let message = req.flash('error')
    if (message.length > 0){
      message = message[0];
    } else {
      message = null
    }
    
    res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    isAuthenticated: req.session.isLoggedIn,
    errorMessage: message,
    prevInput: {
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationErrors: []
  })
}

exports.postSignup = (req,res,next) => {
  const email = req.body.email
  const password = req.body.password;
  const confirmPassword = req.body.password;

  const errors = validationResult(req);
  console.log(errors.array())

  if(!errors.isEmpty()){
    return res.status(422).render('auth/signup', {
      path: '/signup',
      pageTitle: 'Signup',
      isAuthenticated: req.session.isLoggedIn,
      errorMessage: errors.array()[0].msg,
      prevInput: {email, password, confirmPassword},
      validationErrors: errors.array()
    })
  }

  User.findOne({email: email})
    .then(userDoc => {
      if(userDoc) {
        return res.status(422).render('auth/signup', {
          path: '/signup',
          pageTitle: 'Signup',
          isAuthenticated: req.session.isLoggedIn,
          errorMessage: 'User Already Exist',
          prevInput: {email, password, confirmPassword},
          validationErrors: errors.array()
        })
      }

      bcrypt.hash(password, 12)
      .then(hashed => {
        const user = new User({email, password: hashed, cart: {items: []}})
        return user.save()
      })
      .then( result => {
        res.redirect('/login')
        transporter.sendMail({
          to: email,
          from: 'xyz@gmail.com',
          subject: 'Signup succeeded',
          html: '<h1>You Successfully Signup</h1>'
        }).catch(err => {
          console.log(err)
        })
      })
    })
    .catch(err => {
      console.log('error: failed to save user', err)
    })
}

exports.getReset = (req, res, next) => {
  let message = req.flash('error')
  if (message.length > 0){
    message = message[0];
  } else {
    message = null
  }
  // console.log(req.get('Cookie'))
  console.log(req.session.isLoggedIn)
  res.render('auth/reset', {
     path: '/reset',
    pageTitle: 'Reset Password',
    isAuthenticated: req.session.isLoggedIn,
    errorMessage: message,
  })
}

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      return res.redirect('/reset')
    }

    const token = buffer.toString('hex');

    User.findOne({email: req.body.email})
      .then(user => {
        if(!user) {
          req.flash('error', 'User email account is not found')
          return res.redirect('/reset')
        }

        user.resetToken = token;
        user.resetTokenExpiry = Date.now() + 3600000

        user.save()
          .then(result => {
            transporter.sendMail({
              to: user.email,
              from: 'arslan05342@gmail.com',
              subject: 'Reset Password',
              html: `
                <p>You requested Password reset</p>
                <p>Click this <a href = "http://localhost:3000/reset/${user.resetToken}">Link</a> to set a new password</p>
              `
            }).catch(err => {
              console.log(err)
            })
            return res.redirect('/')
          })
        
      })
      .catch(err => {
        console.log(err)
      })
    
  })
}

exports.getNewPassword = (req, res, next) => {
  const token = req.params.resetToken;

  User.findOne({resetToken: token, resetTokenExpiry: {$gt: Date.now()}})
    .then(user => {
      if(!user) {
        req.flash('error', 'Token Expire or wrong link')
        return res.redirect('/login')
      }

        let message = req.flash('error')
        if (message.length > 0){
          message = message[0];
        } else {
          message = null
        }

        res.render('auth/new-password', {
          path: '/new-password',
          pageTitle: 'Update Password',
          isAuthenticated: req.session.isLoggedIn,
          errorMessage: message,
          userId: user._id.toString(),
          passwordToken: token
        })
    })
}

exports.postNewPassword = async (req, res, next) => {
  const token = req.body.passwordToken;
  const userId = req.body.userId;
  const password = req.body.password

  const hashed = await bcrypt.hash(password, 12)
  console.log(hashed)


  User.findOne({_id: userId, resetToken: token, resetTokenExpiry: {$gt: Date.now()}})
    .then(user => {
      if(!user, !token, !password){
        req.flash('error', 'Token Expire or wrong link')
        return res.redirect('/login')
      }
      user.password = hashed;
      user.resetToken = undefined;
      user.resetTokenExpiry = undefined;
      return user.save()
    })
    .then(result => {
      return res.redirect('/login')
    })
    .catch(err => {
      console.log(err)
    })
}

// res .setHeader('Set-Cookie', 'loggedIn=true0'); // or simple with express res.set(//same) 
// res.cookie('loggedIn', 'true', { // given by express and second obkect isoptional 
//   httpOnly: true,
//   secure: false,   // true if using HTTPS
//   maxAge: 24 * 60 * 60 * 1000
// });