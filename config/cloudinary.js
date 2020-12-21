var cloudinary = require('cloudinary');

cloudinary.config({
  cloud_name: '',// Cloudinary cloud name
  api_key: '',// Cloudinary api key
  api_secret: ''// Cloudinary api secret
});

module.exports = cloudinary;
