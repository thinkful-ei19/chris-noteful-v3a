const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema({
    name: {type: String},
    created: { type: Date, default: Date.now },
})

tagSchema.set('toObject', {
    transform: function (doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    }
});

module.exports = mongoose.model('Tag', tagSchema);

//Schema Creation needs review