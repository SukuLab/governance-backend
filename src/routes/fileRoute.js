
var express = require('express');
var router = express.Router();
var fileController = require('../controllers/fileController');

/* Get calls */
router.route('/image')
  .post((req, res) => {
    fileController.saveImage(req, (response) => {
      res.send(response);
    });
  })
  .get((req, res) => {
    fileController.fetchImage(req, (response) => {
      res.send(response);
    });
  });

module.exports = router;