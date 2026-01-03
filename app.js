const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const flash = require('connect-flash');

const errorController = require('./controllers/error');
const mongoConnect = require('./util/database').mongoConnect;

const app = express();
const store = new MongoDBStore({
  uri: 'mongodb://127.0.0.1:27017/shop',
  collection: 'sessions',
})

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

const User = require('./models/user');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({secret: 'my secretjkl', resave: false, saveUninitialized: false, store: store})), // also set cookie: age etc
app.use(flash());

app.use((req, res, next) => { 
  if(!req.session.user){
    return next();
  }
  User.findById(req.session.user._id)
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

mongoose.connect('mongodb://127.0.0.1:27017/shop')
  .then(result => {
    // User.findOne()
    //   .then(user => {
    //     if(!user) {
    //       const newUser = new User({ name: 'admin', email: 'admin@gmail.com' })
    //       newUser.save();
    //     }
    //   })
    app.listen(3000);
    console.log('successfuy connected database');
  })
  .catch(err => {

  })

// mongoConnect( () => {
//   console.log('db connected Successfuly')
//   app.listen(3000);
// });
