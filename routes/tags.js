const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Tag = require('../models/tag');
const Note = require('../models/note');

//GET all /tags

router.get('/tags', (req, res, next) => {
    const { searchTerm } = req.query;
    let filter = {};

    if (searchTerm) {
        const re = new RegExp(searchTerm, 'i');
        filter.name = { $regex: re };
    }

    Tag.find(filter)
        .sort('created')
        .then((result) => {
            res.json(result);
        })
        .catch((error) => {
            next(error);
        })
})

//GET /tags by id
router.get('/tags/:id', (req, res, next) => {
    //const id = req.params.id;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        const err = new Error('The `id` is not valid');
        err.status = 400;
        return next(err);
      }

    Tag.findById(id)
        .then((result) => {
            if (result === null) {
                res.status(404).end()
            } else {
                res.json(result)
            }
        })
        .catch((error) => {
            next(error)
        })
})

//POST /tags to create a new tag
router.post('/tags', (req, res, next) => {
    const { name } = req.body 

    if (!name) {
        const err = new Error('Missing `name` in request body');
        err.status = 400;
        return next(err);
    }

    const newData = { name };

    Tag.findOne({'name': name})
    .then(result=> {
        if (result !== null) {
            if (result.name === name) {
                const err = new Error('The folder name already exists');
                err.status = 400;
                return next(err);
            }
        }
        else {
            const newTag = { name };
            Tag.create(newTag)
            .then(result => {
                res.location(`${req.originalUrl}/${result.id}`).status(201).json(result);
            })
            .catch(err => {
                next(err);
              });
        }
    })
})

//PUT /tags by id to update a tag
router.put('/tags/:id', (req, res, next) => {
    const {id} = req.params;
    const {name} = req.body;

    if (!name) {
        const err = new Error('Missing `name` in request body');
        err.status = 400;
        return next(err);
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
        const err = new Error('The `id` is not valid');
        err.status = 400;
        return next(err);
    }

    const newData = {name};
    //Need to come back and understand what options really is more in detail.
    const options = { new: true };


    Tag.findByIdAndUpdate(id, newData, options)
        .then((result) => {
            if (result) {
                res.json(result);
            } else {
                res.status(404).end()
            }
        })
        .catch((err) => {
            if (err.code === 11000) {
                err = new Error('The tag name already exists');
                err.status = 400;
              }
            next(err);
        })

})

//DELETE /tags by id deletes the tag AND removes it from the notes collection
router.delete('/tags/:id', (req, res, next) => {
    const {id} = req.params;

    Tag.findByIdAndRemove(id)
        .then(() => {
            console.log(id);
            Note.update({},
                { $pull: { tags:  id  } },
                { multi: true }
            )
            res.status(204).end();
        })
        .catch((error) => {
            next(error);
        })

})



module.exports = router;