const express = require('express');
const {ensureAuthenticated , ensureGuest} = require('../helpers/auth');
//load models
require('../models/Story');
const mongoose = require('mongoose');
const Story = mongoose.model('stories');
const router = express.Router();

//home page
router.get('/' ,ensureGuest, (req,res) => {
  res.render('index/welcome');
});

//dashboard route
router.get('/dashboard' ,ensureAuthenticated, (req,res) => {
  Story.find({user : req.user.id})
    .then(stories => {
      res.render('index/dashboard' , {
        stories: stories
      });
    });
}); 

//about route
router.get('/about' , (req,res) => {
  res.render('index/about');
});

module.exports = router;