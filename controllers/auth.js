const user = require("../models/user");

exports.getLogin = (req, res, next) => {
  // console.log(req.get('Cookie'))
  console.log(req.session.isLoggedIn)
  res.render('auth/login', {
     path: '/login',
    pageTitle: 'Login',
    isAuthenticated: req.session.isLoggedIn
  })
}

exports.postLogin = (req, res, next) => {
  user.findById('694c20c5ad98462555f066ee')
    .then(user => {
      req.session.user = user
      req.session.isLoggedIn = true;
      res.redirect('/');
    })
    .catch(err => console.log(err));
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log('error', err)
    res.redirect('/')
  });
};

// res .setHeader('Set-Cookie', 'loggedIn=true0'); // or simple with express res.set(//same) 
// res.cookie('loggedIn', 'true', { // given by express and second obkect isoptional 
//   httpOnly: true,
//   secure: false,   // true if using HTTPS
//   maxAge: 24 * 60 * 60 * 1000
// });