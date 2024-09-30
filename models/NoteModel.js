const mongoose = require('mongoose');

const noteSchema = mongoose.Schema({
    content :{
        type:String,
        required:true
    },
    author : {
        type: String,
        require: true
    },

    favoriteCount: {
        type: Number,
        default: 0
    },
        // add the favoritedBy property
    favoritedBy: [
        {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
        }
    ]



},{
    timestamps:true
});

const Note = mongoose.model('Note',noteSchema);

module.exports  = Note;