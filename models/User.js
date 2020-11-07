
'use strict';
const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;


var userSchema = Schema( {
  googleid: String,
  googletoken: String,
  googlename:String,
  googleemail:String,
  username:String,
  university:String,
  imageURL: String,
  favorites:[{type:Schema.Types.ObjectId, ref:"Note"}]
} );

module.exports = mongoose.model( 'UserT5', userSchema );
