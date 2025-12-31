const User = require("../models/user");
const bcrypt = require("bcryptjs")

const nodeMailer = require('nodemailer');
const sendGridTransport = require('nodemailer-sendgrid-transport')

const transporter = nodeMailer.createTransport(sendGridTransport({
  auth: {
    api_key: '....--RI7-...'
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
  console.log(req.session.isLoggedIn)
  res.render('auth/login', {
     path: '/login',
    pageTitle: 'Login',
    isAuthenticated: req.session.isLoggedIn,
    errorMessage: message,
  })
}

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  
  User.findOne({email: email})
  .then(user => {
    if(!user){
      req.flash('error', 'Email or Password is not correct')
      return res.redirect('/login')
    }
    bcrypt.compare(password, user.password)
      .then(isMatched => {
        if(!isMatched){
          req.flash('error', 'Email or Password is not correct')
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
  })
}

exports.postSignup = (req,res,next) => {
  const email = req.body.email
  const password = req.body.password;
  const confirmPassword = req.body.password;

  User.findOne({email: email})
    .then(userDoc => {
      if(userDoc) {
        req.flash('error', ' User already exist')
        return res.redirect('/signup')
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
          html: '<h1>You Successfuy Signup</h1>'
        }).catch(err => {
          console.log(err)
        })
      })
    })
    .catch(err => {
      console.log('error: failed to save user', err)
    })


}

// res .setHeader('Set-Cookie', 'loggedIn=true0'); // or simple with express res.set(//same) 
// res.cookie('loggedIn', 'true', { // given by express and second obkect isoptional 
//   httpOnly: true,
//   secure: false,   // true if using HTTPS
//   maxAge: 24 * 60 * 60 * 1000
// });