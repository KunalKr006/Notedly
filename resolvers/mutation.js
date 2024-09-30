const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {AuthenticationError,ForbiddenError} = require('apollo-server-express');
require('dotenv').config();
const gravatar = require('../util/gravatar');
const mongoose = require('mongoose');
module.exports = {
  newNote: async (parent, args, { models, user }) => {
    // if there is no user on the context, throw an authentication error
    if (!user) {
    throw new AuthenticationError('You must be signed in to create a note');
    }
    return await models.Note.create({
    content: args.content,
    // reference the author's mongo id
    author:  new mongoose.Types.ObjectId(user.id)
    });
  },
  deleteNote: async(parent, {id},{models, user}) => {
    
    if (!user) {
      throw new AuthenticationError('You must be signed in to delete a note');
      }
      // find the note
      const note = await models.Note.findById(id);
      // if the note owner and current user don't match, throw a forbidden error
      if (note && String(note.author) !== user.id) {
      throw new ForbiddenError("You don't have permissions to delete the note");
      }
      try {
      // if everything checks out, remove the note
      await note.remove();
      return true;
      } catch (err) {
      // if there's an error along the way, return false
      return false;
      }
    
  },
  updateNote: async(parent,{content, id},{models, user})=>{
    if (!user) {
      throw new AuthenticationError('You must be signed in to update a note');
    }

    const note = await models.Note.findById(id);

    if (note && String(note.author) !== user.id) {
      throw new ForbiddenError("You don't have permissions to update the note");
     }
    
     return await models.Note.findOneAndUpdate(
      {
      _id: id
      },
      {
      $set: {
      content
      }
      },
      {
      new: true
      }
      );
    
    
    
    
  },
  signUp: async (parent,{username,email,password},{models})=> {
      //normalize email address
      email = email.trim().toLowerCase();
      const hashPassword = await bcrypt.hash(password,10);
      const avatar = gravatar(email);
      try {
        const user = await models.User.create({
          username,
          email,
          password:hashPassword,
          avatar
        });
        return jwt.sign({id:user._id},process.env.JWT_SECRET_KEY);
      } catch (error) {
        console.log(error);
        throw new Error('Error creating account');
      }  
  },
  signIn : async(parent,{username,email,password},{models})=>{
    //normalize email
    if(email) {
      email = email.trim().toLowerCase();
    }
    try {
      //sign in using either username or email
      const user = await models.User.findOne({$or:[{email},{username}]});
      //check if user exist 
      if(!user) {
        throw new AuthenticationError('Invalid Credentials');
      }
      else {
        const isValidPassword = await bcrypt.compare(password,user.password);
        if(isValidPassword){
          return jwt.sign({id:user._id},process.env.JWT_SECRET_KEY);
        }
        else {
          throw new AuthenticationError('Invalid Credentials');
        }
      }
    } catch (error) {
      console.log(error);
      if (error instanceof AuthenticationError) {
        throw error; // Rethrow to keep the specific error message
      }
      throw new Error('Error signing in');
    }
  },

  toggleFavorite: async (parent, { id }, { models, user }) => {
    if (!user) {
      throw new AuthenticationError();
    }

    let noteCheck = await models.Note.findById(id);
    const hasUser = noteCheck.favoritedBy.indexOf(user.id);

    if (hasUser >= 0) {
      return await models.Note.findByIdAndUpdate(
      id,
      {
        $pull: {
        favoritedBy: new mongoose.Types.ObjectId(user.id)
      },
      $inc: {
        favoriteCount: -1
      }
      },
      {
      // Set new to true to return the updated doc
      new: true
      }
      );
    } else{
      return await models.Note.findByIdAndUpdate(
        id,
        {
          $push: {
            favoritedBy: new mongoose.Types.ObjectId(user.id)
          },
          $inc: {
            favoriteCount: 1
          }
        },
        {
          new: true
        }
      )
    }
  }

  

};
