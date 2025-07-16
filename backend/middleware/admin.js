const User = require('../models/User');

// This middleware checks if the logged-in user has admin privileges.
// It should be placed *after* the standard 'auth' middleware in any route definition.
module.exports = async function(req, res, next) {
  try {
    // The 'auth' middleware has already attached the user's ID to the request.
    const user = await User.findById(req.user.id);

    if (!user) {
        return res.status(404).json({ msg: 'Bruger ikke fundet' });
    }

    // Check if the user role is 'admin'.
    // In a future setup, this might check for multiple roles.
    if (user.role !== 'admin') {
        return res.status(403).json({ msg: 'Adgang nægtet. Admin-rettigheder påkrævet.' });
    }
    
    // If the user is an admin, proceed to the next middleware or route handler.
    next();
  } catch (error) {
    console.error('Admin middleware fejl:', error.message);
    res.status(500).send('Serverfejl');
  }
} 