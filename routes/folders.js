const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Folder = require('../models/folder');

//GET all /folders
router.get('/folders', (req, res, next) => {

    const { searchTerm} = req.query;

    let filter = {};
  
    if (searchTerm) {
      const re = new RegExp(searchTerm, 'i');
      filter.name = { $regex: re };
    }

    Folder.find(filter)
        .sort('created')
        .then(result => {
            res.json(result)
        })
        .catch(err => {
            next(err);
        })
})
//Get /folders by id
router.get('/folders/:id', (req, res, next) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        const err = new Error('The `id` is not valid');
        err.status = 400;
        return next(err);
    }

    Folder.findById(id)
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
//POST /folders to create a new folder
router.post('/folders', (req, res, next) => {
    const { name } = req.body;
    if (!name) {
        const err = new Error('Missing `name` in request body');
        err.status = 400;
        return next(err);
    }

    Folder.findOne({'name': name})
        .then(result=> {
            if (result !== null) {
                if (result.name === name) {
                    const err = new Error('The folder name already exists');
                    err.status = 400;
                    return next(err);
                }
            }
            else {
                const newFolder = { name };
                Folder.create(newFolder)
                .then(result => {
                    res.location(`${req.originalUrl}/${result.id}`).status(201).json(result);
                })
                .catch(err => {
                    next(err);
                  });
            }
        })
    

    // Folder.create(newFolder)
    //     .then(result => {
    //         res.location(`${req.originalUrl}/${result.id}`).status(201).json(result);
    //     })
    //     .catch(err => {
    //         if (err.code === 11000) {
    //           err = new Error('The folder name already exists');
    //           err.status = 400;
    //         }
    //         next(err);
    //       });

})

//PUT /folders by id to update a folder name
router.put('/folders/:id', (req, res, next) => {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
        const err = new Error('Missing `name` in request body')
        err.status = 400;
        return next(err);
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
        const err = new Error('The `id` is not valid');
        err.status = 400;
        return next(err);
    }

    const updateItem = { name };
    const options = { new: true };

    Folder.findByIdAndUpdate(id, updateItem, options)
        .then(result => {
            if (result) {
                res.json(result);
            }
            else {
                next();
            }
        })
        .catch(err => {
            if (err.code === 11000) {
              err = new Error('The folder name already exists');
              err.status = 400;
            }
            next(err);
          });
})


//DELETE /folders by id which deletes the folder AND the notes contents
router.delete('/folders/:id', (req, res, next) => {
    const { id } = req.params;

    Folder.findByIdAndRemove(id)
        .then(() => {
            res.status(204).end();
        })
        .catch(err => {
            next(err);
        })
})


module.exports = router;
