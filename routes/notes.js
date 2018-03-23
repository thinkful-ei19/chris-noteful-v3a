'use strict';

const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');

const Note = require('../models/note');

/* ========== GET/READ ALL ITEMS ========== */
router.get('/notes', (req, res, next) => {
  const { searchTerm, folderId, tagId } = req.query;

  let filter = {};

  if (searchTerm) {
    const re = new RegExp(searchTerm, 'i');
    filter.title = { $regex: re };
  }

  if (folderId) {
    filter = { folderId }
  }

  if (tagId) {
    filter.tags = tagId;
  }

  // if (tagId) {
  //   Note.find(filter)
  //     .sort('created')
  //     .populate('folderId')
  //     .populate('tags')
  //     .then((results) => {
  //       let arr = [];
  //       results.forEach((item) => {
  //         let check;
  //         item.tags.forEach((tagItem) => {
  //           check = false;
  //           if (tagItem.id === tagId) {
  //             check = true;
  //           }
  //           if (check === true) {
  //             arr.push(item);
  //           }
  //         }) 
  //       })
  //       return arr;
  //     })
  //     .then((results) => {
  //       console.log(results);
  //       res.json(results);
  //     })
  //     .catch(err => {
  //       next(err);
  //   });
  // }
  // if (tagId) {
  //   Note.find(filter)
  //     .then((results) => {
  //       let arr = [];
  //       results.forEach((item) => {
  //         if (item.tags.indexOf(tagId) !== -1) {
  //           arr.push(item);
  //         }
  //       })
  //       return arr;
  //     })
  //     .then((results) => {
  //       console.log(results);
  //       res.json(results);
  //     })
  //     .catch(err => {
  //       next(err);
  //     });
  // } 
  // else {
    Note.find(filter)
    .sort('created')
    .populate('folderId')
    .populate('tags')
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      next(err);
    });
  // }
});

/* ========== GET/READ A SINGLE ITEM ========== */
router.get('/notes/:id', (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  Note.findById(id)
    .populate('folderId')
    .populate('tags')
    .then(result => {
      if (result) {
        res.json(result);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });
});

/* ========== POST/CREATE AN ITEM ========== */
router.post('/notes', (req, res, next) => {
  const { title, content, folderId, tags } = req.body;

  /***** Never trust users - validate input *****/
  if (!title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }
  if (folderId) {
    if (!mongoose.Types.ObjectId.isValid(folderId)) {
      const err = new Error('The `folderId` is not valid');
      err.status = 400;
      return next(err);
    }
  }
 if (tags) {
  tags.forEach((id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const err = new Error('A tag `id` is not valid');
      err.status = 400;
      return next(err);
    }
  })
 }

  const newItem = { title, content, folderId, tags };

  Note.create(newItem)
    .then(result => {
      res.location(`${req.originalUrl}/${result.id}`).status(201).json(result);
    })
    .catch(err => {
      next(err);
    });
});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/notes/:id', (req, res, next) => {
  const { id } = req.params;
  const { title, content, folderId, tags } = req.body;

  /***** Never trust users - validate input *****/
  if (!title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }
  if (folderId) {
    if (!mongoose.Types.ObjectId.isValid(folderId)) {
      const err = new Error('The `folderId` is not valid');
      err.status = 400;
      return next(err);
    }
  }
 if (tags) {
  tags.forEach((id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const err = new Error('A tag `id` is not valid');
      err.status = 400;
      return next(err);
    }
  })
 }

  const updateItem = { title, content, folderId, tags };
  const options = { new: true };

  Note.findByIdAndUpdate(id, updateItem, options)
    .then(result => {
      if (result) {
        res.json(result);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });
});

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/notes/:id', (req, res, next) => {
  const { id } = req.params;

  Note.findByIdAndRemove(id)
    .then(() => {
      res.status(204).end();
    })
    .catch(err => {
      next(err);
    });
});

module.exports = router;