const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const exphbs = require('express-handlebars');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');
const bodyParser = require('body-parser');
const passport = require('passport');

const app = express();

//Load Routes
const auth = require('./routes/auth');
const index = require('./routes/index');
const stories = require('./routes/stories');

//load models
require('./models/User');
require('./models/Story');

//passport config
require('./config/passport')(passport);

//Load Keys
const keys = require('./config/keys');

//load handlebars helpers
const {
  truncate,
  stripTags,
  formatDate,
  select,
  editIcon
} = require('./helpers/hbs');

//express-session middleware
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false,
}));
//passport middleware(after express-session middleware only)
app.use(passport.initialize());
app.use(passport.session());
//cookie parser middleware
app.use(cookieParser());
//express handlebars middleware
app.engine('handlebars', exphbs({
  helpers : {
    truncate: truncate,
    stripTags : stripTags,
    formatDate : formatDate,
    select : select,
    editIcon : editIcon
  },
  defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');
//body-parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
//method-override middleware
app.use(methodOverride('_method'));

//static path
app.use(express.static(path.join(__dirname , 'public')));

//map global promise
mongoose.Promise = global.Promise;
//Connect to Mongoose
mongoose.connect(keys.mongoURI , {
  useNewUrlParser: true
})
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err));

//set global variables
app.use((req,res,next) => {
  res.locals.user = req.user || null;
  next();
});

//use routes
app.use('/auth' , auth);
app.use('/' , index);
app.use('/stories' , stories);

//server
const port = process.env.PORT || 4000;

app.listen(port , ()=> {
  console.log(`server started on port ${port}`);
});