'use strict';
const mongoose = require( 'mongoose');
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;



const commentSchema = Schema( {
  user:String,
  userId: ObjectId,
  note: {type:Schema.Types.ObjectId, ref:"Note"},
  createdAt: Date,
  comment:String,
  rate:Number
});

module.exports = mongoose.model('CommentT5', commentSchema);
