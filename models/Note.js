'use strict';
const mongoose = require( 'mongoose');
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;



const noteSchema = Schema( {
  term:String,
  subject: String,
  title: String,
  courseID: String,
  section:String,
  authorID: ObjectId,
  author: String,
  authorEmail: String,
  note: String,
  createdAt: Date
});

module.exports = mongoose.model('NoteT5', noteSchema);
