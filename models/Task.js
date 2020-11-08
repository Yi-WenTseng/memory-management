'use strict';
const mongoose = require( 'mongoose');
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;



const taskSchema = Schema( {
  user:String,
  userId: ObjectId,
  time:String,
  activity:String,

});

module.exports = mongoose.model('TaskItem', taskSchema);
