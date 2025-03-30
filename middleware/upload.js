const multer = require('multer');
const path = require('path');

// Set up storage for files
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    if (file.fieldname === 'resume') {
      cb(null, 'uploads/resumes');
    } else if (file.fieldname === 'avatar') {
      cb(null, 'uploads/avatars');
    } else if (file.fieldname === 'logo') {
      cb(null, 'uploads/logos');
    } else {
      cb(null, 'uploads/others');
    }
  },
  filename: function(req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

// Check file type
const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'resume') {
    if (file.mimetype === 'application/pdf' || 
        file.mimetype === 'application/msword' || 
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      cb(null, true);
    } else {
      cb(new Error('Please upload a valid resume document (PDF or DOC/DOCX)'), false);
    }
  } else if (file.fieldname === 'avatar' || file.fieldname === 'logo') {
    if (file.mimetype === 'image/jpeg' || 
        file.mimetype === 'image/png' || 
        file.mimetype === 'image/jpg') {
      cb(null, true);
    } else {
      cb(new Error('Please upload a valid image (JPEG, JPG or PNG)'), false);
    }
  } else {
    cb(null, true);
  }
};

// Create upload object
const upload = multer({
  storage: storage,
  limits: { fileSize: 10000000 }, // 10MB max file size
  fileFilter: fileFilter
});

module.exports = upload;