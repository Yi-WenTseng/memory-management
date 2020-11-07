'use strict';
const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;

var medicineSchema = Schema( {
  name: String,
  dose: String,
  time: String
} );

module.exports = mongoose.model( 'MedicineItem', medicineSchema );
