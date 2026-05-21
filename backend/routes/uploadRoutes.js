const router  = require('express').Router();
const { upload, cloudinary } = require('../config/cloudinary');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const asyncHandler = require('express-async-handler');

// Upload single product image
router.post(
  '/product',
  protect, adminOnly,
  upload.single('image'),
  asyncHandler(async (req, res) => {
    if (!req.file) throw new Error('No file uploaded');
    res.json({
      success:   true,
      url:       req.file.path,
      public_id: req.file.filename,
    });
  })
);

// Delete image from Cloudinary
router.delete(
  '/product/:public_id',
  protect, adminOnly,
  asyncHandler(async (req, res) => {
    await cloudinary.uploader.destroy(req.params.public_id);
    res.json({ success: true, message: 'Image deleted' });
  })
);

module.exports = router;
