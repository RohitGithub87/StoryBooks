const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
//bring in models
require('../models/User');
require('../models/Story');
const User = mongoose.model('users');
const Story = mongoose.model('stories');

const {ensureAuthenticated , ensureGuest} = require('../helpers/auth');



//stories index route
router.get('/' , (req,res) => {
  Story.find({status:'public'})
    .populate('user')
    .sort({date : 'desc'})
    .then(stories => {
      res.render('stories/index' , {
        stories : stories
      });
    });
});

//stories add route
router.get('/add' ,ensureAuthenticated, (req,res) => {
  res.render('stories/add');
});

// Show Single Story
router.get('/show/:id', (req, res) => {
  Story.findOne({
    _id: req.params.id
  })
  .populate('user')
  .populate('comments.commentUser')
  .then(story => {
    if(story.status == 'public'){
      res.render('stories/show', {
        story:story
      });
    } else {
      if(req.user){
        if(req.user.id == story.user._id){
          res.render('stories/show', {
            story:story
          });
        } else {
          res.redirect('/stories');
        }
      } else {
        res.redirect('/stories');
      }
    }
  });
});
//edit story route
router.get('/edit/:id' ,ensureAuthenticated, (req,res) => {
  Story.findOne({_id : req.params.id})
    .then(story => {
      if(story.user != req.user.id){
        res.redirect('/stories');
      }else{
        res.render('stories/edit' , {
          story: story
        });
      }
    });
});

//list stories from a particular user
router.get('/user/:userId' , (req,res) => {
  Story.find({user : req.params.userId , status: 'public'})
    .populate('user')
    .then(stories => {
      res.render('stories/index' , {
        stories: stories
      });
    });
});

//logged in user stories
router.get('/my' ,ensureAuthenticated, (req,res) => {
  Story.find({user: req.user.id})
    .populate('user')
    .then(stories => {
      res.render('stories/index' , {
        stories: stories
      });
    });
});

//add story process form
router.post('/' , (req,res) => {
  
  let allowComments;
  if(req.body.allowComments){
    allowComments =true;
  }else{
    allowComments =false;
  }

   const newStory = {
     title : req.body.title,
     status : req.body.status,
     allowComments : allowComments,
     body : req.body.body,
     user : req.user.id
   }

   new Story(newStory)
    .save()
    .then(story => {
      res.redirect(`/stories/show/${story.id}`);
    });

});

//edit story form 
router.put('/:id' , (req,res) => {
  Story.findOne({_id : req.params.id})
    .then(story => {
      let allowComments;

      if(req.body.allowComments){
        allowComments = true;
      }else{
        allowComments =false;
      }

      story.title = req.body.title;
      story.status = req.body.status;
      story.allowComments = allowComments;
      story.body = req.body.body;

      story.save()
        .then(story => {
          res.redirect('/dashboard');
        });
    });
});

//delete story route
router.delete('/:id' , (req,res) => {
  Story.deleteOne({_id : req.params.id})
    .then(() => {
      res.redirect('/dashboard');
    })
});

//add comments route
router.delete('/:id', (req, res) => {
  Story.remove({_id: req.params.id})
    .then(() => {
      res.redirect('/dashboard');
    });
});

// Add Comment
router.post('/comment/:id', (req, res) => {
  Story.findOne({
    _id: req.params.id
  })
  .then(story => {
    const newComment = {
      commentBody: req.body.commentBody,
      commentUser: req.user.id
    }

    // Add to comments array
    story.comments.unshift(newComment);
    

    story.save()
      .then(story => {
        res.redirect(`/stories/show/${story.id}`);
      });
  });
});

module.exports = router;