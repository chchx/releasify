const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let userDataSchema = new Schema({
  email: String,
  data: Schema.Types.Mixed
});

let userData = mongoose.model('userData', userDataSchema)

module.exports = userData;