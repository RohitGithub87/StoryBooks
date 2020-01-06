const express = require('express');
const router = express.Router();
const passport = require('passport');

router.get('/google' , passport.authenticate('google' , {scope : ['profile' , 'email']}));

//callback auth: google
router.get('/google/callback' , passport.authenticate('google' , {failureRedirect : '/'}) ,(req,res) => {
  //succesful authentication
  res.redirect('/dashboard');
});

//verify route
router.get('/verify' , (req,res) => {
  if(req.user){
    console.log(req.user);
  }else{
    console.log('not auth');
  }
});

//logout route
router.get('/logout' , (req,res) => {
  req.logout();
  res.redirect('/');
});

module.exports = router;