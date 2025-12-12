const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Pet = require('../models/Pet');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// @route   GET /api/pets
// @desc    Get all missing pets with filters
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { species, city, radius, lat, lng, status } = req.query;
    let query = {};

    if (species) query.species = species;
    if (status) query.status = status;

    let pets;
    
    if (lat && lng && radius) {
      const location = {
        type: 'Point',
        coordinates: [parseFloat(lng), parseFloat(lat)]
      };
      
      pets = await Pet.find({
        ...query,
        location: {
          $near: {
            $geometry: location,
            $maxDistance: parseInt(radius) * 1000 // Convert km to meters
          }
        }
      });
    } else if (city) {
      pets = await Pet.find({ ...query, 'location.city': city });
    } else {
      pets = await Pet.find(query);
    }

    res.json(pets);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/pets
// @desc    Report a missing pet
// @access  Private
router.post(
  '/',
  [
    auth,
    upload.array('images', 5),
    body('name', 'Name is required').not().isEmpty(),
    body('species', 'Species is required').not().isEmpty(),
    body('address', 'Address is required').not().isEmpty(),
    body('contactPhone', 'Valid phone number is required').not().isEmpty(),
    body('contactEmail', 'Valid email is required').isEmail()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const petData = req.body;
      
      // Handle image uploads
      let images = [];
      if (req.files) {
        images = req.files.map(file => ({
          url: file.path,
          public_id: file.filename
        }));
      }

      const pet = new Pet({
        ...petData,
        images,
        owner: req.user.id
      });

      await pet.save();
      res.status(201).json(pet);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   GET /api/pets/:id
// @desc    Get pet by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id).populate('owner', 'name email');
    if (!pet) {
      return res.status(404).json({ msg: 'Pet not found' });
    }
    res.json(pet);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/pets/:id
// @desc    Update pet status
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    let pet = await Pet.findById(req.params.id);
    
    if (!pet) {
      return res.status(404).json({ msg: 'Pet not found' });
    }

    // Check ownership
    if (pet.owner.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    pet = await Pet.findByIdAndUpdate(
      req.params.id,
      { $set: req.body, updatedAt: Date.now() },
      { new: true }
    );

    res.json(pet);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;