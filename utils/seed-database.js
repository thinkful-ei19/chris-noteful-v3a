const mongoose = require('mongoose')

const { MONGODB_URI } = require('../config');
const Note = require('../models/note');
const Folder = require('../models/folder')
const Tag = require('../models/tag')

const seedNotes = require('../db/seed/notes');
const seedFolders = require('../db/seed/folders');
const seedTags = require('../db/seed/tags');

// mongoose.connect(MONGODB_URI)
//     .then(() => mongoose.connection.db.dropDatabase())
//     .then(() => Note.insertMany(seedNotes))
//     .then(results => {
//         console.info(`Inserted ${results.length} Notes`);
//     })
//     .then(() => mongoose.disconnect())
//     .catch(err => {
//         console.error(err);
//     });

// mongoose.connect(MONGODB_URI)
//   .then(() => mongoose.connection.db.dropDatabase())
//   .then(() => Note.insertMany(seedNotes))
//   .then(() => Note.createIndexes())
//   .then(() => {
//     console.info(`Inserted Notes`);
//   })
//   .then(() => mongoose.disconnect())
//   .catch(err => {
//     console.error(err);
//   });

mongoose.connect(MONGODB_URI)
  .then(() => mongoose.connection.db.dropDatabase())
  .then(() => {
    return Promise.all([
      Note.insertMany(seedNotes),
      Folder.insertMany(seedFolders),
      Tag.insertMany(seedTags),
      Note.createIndexes(),
      Folder.createIndexes(),
      Tag.createIndexes()
    ])
    console.log('Rewrote Database')
  })
  .then(() => mongoose.disconnect())
  .catch(err => {
    console.error(`ERROR: ${err.message}`);
    console.error(err);
  })