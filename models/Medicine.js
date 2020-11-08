'use strict';
const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;

var medicineSchema = Schema( {
  name: String,  //name of medication, not person
  authorID: ObjectId,
  author: String,
  dose: String,
  time: String,
  note: String
} );

module.exports = mongoose.model( 'MedicineItem', medicineSchema );
