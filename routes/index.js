var express = require('express');
var router = express.Router();
const fs = require("fs");
const userModel = require('./users')
const videoModel = require('./video')
const upload = require('./multer')
var passport = require('passport')
var localStrategy = require('passport-local');
const e = require('express');
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
   const range = req.headers.range
   const parts = range.replace("bytes=","").split("-")
   const start = parseInt(parts[ 0 ], 10)
   let chunksize = 1024 * 1024 * 4
   let end = start + chunksize - 1

   const file = fs.statSync(`./public/video/${req.params.idfile}`)
   const filesize = file.size

   if(end>=filesize){
    end = filesize-1
    chunksize = start - end + 1
   }
   
   const head = {
    "Content-Range": `bytes ${start}-${end}/${filesize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": chunksize,
    "Content-Type": "video/mp4",
   };
   res.writeHead(206, head)
   fs.createReadStream(`./public/video/${req.params.idfile}`,{
   start, end
   }).pipe(res)

  
})



module.exports = router;
