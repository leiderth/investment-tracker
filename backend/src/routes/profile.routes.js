const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profile.controller');
const { authenticateToken } = require('../middleware/auth');
const multer = require('multer');

// Configurar multer para subir archivos
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB máximo
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes'));
    }
  }
});

// Rutas - order matters! More specific routes first
// Picture retrieval (public)
router.get('/picture/:userId', profileController.getProfilePicture);

// Security logs (protected)
router.get('/security-logs', authenticateToken, profileController.getSecurityLogs);

// Picture upload (protected)
router.post('/upload-picture', authenticateToken, upload.single('picture'), profileController.uploadProfilePicture);

// Password change (protected)
router.post('/change-password', authenticateToken, profileController.changePassword);

// Profile operations (protected) - general routes last
router.put('/', authenticateToken, profileController.updateProfile);
router.get('/', authenticateToken, profileController.getProfile);

module.exports = router;
