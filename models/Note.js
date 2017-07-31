var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var NoteSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  note: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  }
});

var Note = mongoose.model("Note", NoteSchema);

module.exports = Note;