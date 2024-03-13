var express = require('express');
var router = express.Router();
const fs = require("fs");
const userModel = require('./users')
const videoModel = require('./video')
const upload = require('./multer')
var passport = require('passport')
var localStrategy = require('passport-local')
passport.use(new localStrategy(userModel.authenticate()))


router.get('/', isloggedIn, async function (req, res, next) {
  const user = await userModel.findOne({username:req.session.passport.user}) 
  const videos = await videoModel.find()
  res.render('index', { title: 'Express', videos, user });
});

router.get('/login', (req, res, next) => {
  res.render('login')
})

router.get('/register', (req, res, next) => {
  res.render('register')
})

router.get('/currentVideo/:id', isloggedIn, async function (req, res, next) {
  const videos = await videoModel.findById(req.params.id)
  console.log(videos)
  res.render('currentVideo',{videos})
})

router.get('/upload', isloggedIn, (req, res, next) => {
  res.render('upload')
})


/* *****************  user authentication routes and function ***************** */

router.post('/register', function (req, res) {
  var userData = new userModel({
    username: req.body.username
  })
  userModel
    .register(userData, req.body.password)
    .then(function (registeredUser) {
      passport.authenticate('local')(req, res, function () {
        res.redirect('/');
      })
    })
});

router.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
  }),
  (req, res, next) => { }
);

function isloggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  else res.redirect('/login');
}

router.get('/logout', (req, res, next) => {
  if (req.isAuthenticated())
    req.logout((err) => {
      if (err) res.send(err);
      else res.redirect('/');
    });
  else {
    res.redirect('/');
  }
});

/* *****************  user authentication routes and function ***************** */

router.post('/upload', isloggedIn, upload.single('video_file'), async (req, res, next) => {
  const newvideo = await videoModel.create({
    media: req.file.filename,
    user: req.user._id,
    title: req.body.title,
    description:req.body.description
  })
  res.send(newvideo)
  console.log(newvideo)
})


router.get('/stream/:idfile',isloggedIn, async (req, res, next) => {
   fs.createReadStream(`./public/video/${req.params.idfile}`).pipe(res)
  
})



module.exports = router;
