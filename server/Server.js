var express = require('express');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var connect = process.env.MONGODB_URI;
var User = require('./models/models').User;
var cors = require('cors');
var compression = require('compression');
import AdminApp from './firebaseAdmin';
var CryptoJS = require("crypto-js");

var REQUIRED_ENV = "SECRET MONGODB_URI".split(" ");

REQUIRED_ENV.forEach(function(el) {
  if (!process.env[el]){
    console.error("Missing required env var " + el);
    process.exit(1);
  }
});

mongoose.connect(connect);
mongoose.Promise = global.Promise;

var models = require('./models/models');

//put in dbRoutes
var dbGeneralRoutes = require('./routes/dbRoutes/dbGeneralRoutes');
var dbGetRoutes = require('./routes/dbRoutes/dbGetRoutes');
var dbSaveRoutes = require('./routes/dbRoutes/dbSaveRoutes');
var dbUpdateRoutes = require('./routes/dbRoutes/dbUpdateRoutes');
var awsRoutes = require('./routes/awsAccess');
var auth = require('./routes/authorization');
var emailRoutes = require('./routes/email');
var app = express();

app.use(logger('tiny'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// app.use(expressValidator());
app.use(cookieParser());
//IF WE NEED TO SERVE SOME FILES (stylesheets, scripts, etc.), USE THIS:
// app.use(express.static(path.join(__dirname, 'public')));

app.use(compression({ filter: shouldCompress }))

function shouldCompress(req, res) {
  if (req.headers['x-no-compression']) {
    // don't compress responses with this request header 
    return false
  }

  // fallback to standard filter function 
  return compression.filter(req, res)
}

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Headers", "Content-Type, *");
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});
const corsOptions = {
  origin: '*'
};

app.use(cors(corsOptions));

var mongoStore = new MongoStore({ 
    mongooseConnection: mongoose.connection,
    collection: 'user-sessions',
  });

// Passport
app.use(session({
  secret: process.env.SECRET,
  store: mongoStore,
  resave: true
  // userToken: null
}));

app.use(function(req, res, next) {
  console.log('use function', req.session.userMToken);
  if(req.user) {
    next()
  }
  if (req.session.userMToken) {
    // const mongoIdByte = CryptoJS.AES.decrypt(req.session.userMToken.toString(), 'secret');
    // const mongoId = mongoIdByte.toString(CryptoJS.enc.Utf8);
    User.findById(req.session.userMToken)
        .then((response) => {
          // console.log(response);
          req.user = response;
          next()
        })
  } else {
    req.user = undefined;
    next();
  }
});

app.get('/', function(req, res, next) {
  if (!req.user) {
    res.redirect('/login')
  } 
  else {
    if (req.user.currentCommunity) {
      User.findById(req.user._id)
          .populate('currentCommunity')
          .then((user) => {
              const url = '/community/' + user.currentCommunity.title.split(' ').join('') + '/discover';
              res.redirect(url);
          })
    }
    else {
      res.redirect('/walnuthome')
    }
  }
});

app.post('/auth/logout', function(req, res) {
    mongoStore.destroy(req.session.id, function() {
      req.session.destroy();
      res.json({success:true});
    })
  });

app.use('/auth', auth);
app.use('/db', dbGeneralRoutes);
app.use('/db/get', dbGetRoutes);
app.use('/db/save', dbSaveRoutes);
app.use('/db/update', dbUpdateRoutes);
app.use('/aws', awsRoutes);
app.use('/email', emailRoutes);
app.use(express.static(path.join(__dirname, '..', 'build')));
app.use('/*', (request, response) => {
    response.sendFile(path.join(__dirname, '..', 'build/index.html')); // For React/Redux
});




// make this dbRoutes when we have the database running


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
});

var port = process.env.PORT || 3000;
app.listen(port);
console.log('Express started. Listening on port %s', port);

module.exports = app;
