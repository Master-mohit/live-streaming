const mongoose = require('mongoose');

const videoSchema = mongoose.Schema({
   media: {
        type:String,
        require: [true, "media is required to upload a video"],
   },
   user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    require: [true, "video can not be upload without user"],
   },
   likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
   }],
   
   
})


module.exports = mongoose.model('video', videoSchema)
