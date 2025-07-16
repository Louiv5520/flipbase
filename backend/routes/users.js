const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');
const admin = require('../middleware/admin'); // Import admin middleware

// --- Multer Setup for File Uploads ---
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/avatars';
    // Create directory if it doesn't exist
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    // Unique filename: user-id-timestamp.extension
    cb(null, `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const uploadAvatar = multer({ 
  storage: avatarStorage,
  limits: { fileSize: 2000000 }, // Limit file size to 2MB
  fileFilter: (req, file, cb) => {
    // Allow only images
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
      return cb(new Error('Kun billedfiler er tilladt!'), false);
    }
    cb(null, true);
  }
}).single('avatar');


// @route   GET api/users/me
// @desc    Get current user's profile
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    // req.user.id is coming from the auth middleware
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/users/me/avatar
// @desc    Upload user avatar
// @access  Private
router.put('/me/avatar', auth, (req, res) => {
    uploadAvatar(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ msg: err.message });
        }
        if (req.file === undefined) {
            return res.status(400).json({ msg: 'Intet fil valgt' });
        }

        try {
            const user = await User.findById(req.user.id);
            if (!user) {
                return res.status(404).json({ msg: 'User not found' });
            }

            // Construct URL path for the file
            const filePath = req.file.path.replace(/\\/g, "/");

            user.profilePicture = filePath;
            await user.save();
            
            // Re-fetch the user to get the full object and send it back
            const updatedUser = await User.findById(req.user.id).select('-password');
            res.json(updatedUser);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    });
});


// @route   PUT api/users/me
// @desc    Update current user's profile
// @access  Private
router.put('/me', auth, async (req, res) => {
  const { name, nickname, gender, country, company } = req.body;

  // Build user object
  const userFields = {};
  if (name) userFields.name = name;
  if (nickname) userFields.nickname = nickname;
  if (gender) userFields.gender = gender;
  if (country) userFields.country = country;
  if (company) userFields.company = company;

  try {
    let user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: userFields },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/users
// @desc    Get all users (admin only)
// @access  Private (Admin)
router.get('/', [auth, admin], async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Serverfejl');
    }
});

// @route   PUT api/users/:id
// @desc    Update a user (admin only)
// @access  Private (Admin)
router.put('/:id', [auth, admin], async (req, res) => {
    const { name, username, email, role } = req.body;

    const userFields = { name, username, email, role };

    try {
        let user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ msg: 'Bruger ikke fundet' });

        user = await User.findByIdAndUpdate(
            req.params.id,
            { $set: userFields },
            { new: true }
        ).select('-password');

        res.json(user);
    } catch (err) {
        console.error(err.message);
        // Handle potential duplicate key error for username/email
        if (err.code === 11000) {
            return res.status(400).json({ msg: 'Brugernavn eller email er allerede i brug.' });
        }
        res.status(500).send('Serverfejl');
    }
});

// @route   DELETE api/users/:id
// @desc    Delete a user (admin only)
// @access  Private (Admin)
router.delete('/:id', [auth, admin], async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ msg: 'Bruger ikke fundet' });

        // Prevent admin from deleting themselves
        if (user.id.toString() === req.user.id) {
            return res.status(400).json({ msg: 'Du kan ikke slette din egen konto.' });
        }

        await User.findByIdAndRemove(req.params.id);
        res.json({ msg: 'Bruger slettet succesfuldt' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Serverfejl');
    }
});


// @route   POST api/users
// @desc    Create a new user (admin only)
// @access  Private (Admin)
router.post('/', [auth, admin, [
  check('name', 'Navn er påkrævet').not().isEmpty(),
  check('username', 'Brugernavn er påkrævet').not().isEmpty(),
  check('email', 'Indtast venligst en gyldig email').isEmail(),
  check('company', 'Firma er påkrævet').not().isEmpty(),
  check('password', 'Adgangskode skal være på mindst 6 tegn').isLength({ min: 6 }),
]], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, username, email, company, password, role } = req.body;

  try {
    let user = await User.findOne({ $or: [{ username }, { email }] });
    if (user) {
      return res.status(400).json({ msg: 'En bruger med dette brugernavn eller email findes allerede' });
    }

    user = new User({
      name,
      username,
      email,
      company,
      password,
      role: role || 'user' // Default role to 'user'
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    res.json({ msg: 'Bruger oprettet succesfuldt' });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Serverfejl');
  }
});

// @route   POST api/users/change-password
// @desc    Change user password
// @access  Private
router.post('/change-password', 
  [
    auth,
    [
      check('currentPassword', 'Nuværende adgangskode er påkrævet').exists(),
      check('newPassword', 'Ny adgangskode skal være på mindst 6 tegn').isLength({ min: 6 }),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;

    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ msg: 'Bruger ikke fundet' });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: 'Nuværende adgangskode er forkert' });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
      await user.save();

      res.json({ msg: 'Adgangskode opdateret succesfuldt' });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Serverfejl');
    }
  }
);


module.exports = router; 