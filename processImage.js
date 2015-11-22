var kMeans = require('./k-means').kMeans,
    fs = require('fs'), 
    gm = require('gm').subClass({imageMagick: true}),
    getPixels = require('get-pixels'),
    savePixels = require('save-pixels'),
    Promise = require('bluebird'),
    config = require('./config'),
    _ = require('lodash');

var getPixelsAsync = Promise.promisify(getPixels);

var time = new Date();
var NUM_ITERATIONS = config.NUM_ITERATIONS;
var K = config.NUM_ITERATIONS
var assignedMs;
var jpeg_name = 'images/beach';
var RESIZED_PATH = './resize.png';


function resizeImage(x, y, path) {
  gm('./' + jpeg_name + '.jpg')
    .resize(x, y)
    .write(path, function (err) {
      if (err) console.log('error:', err);
      console.log('done')
    })
}

resizeImage(150, 150, RESIZED_PATH);

for (var i = 0; i < 1; i++) {
var newImage = fs.createWriteStream(jpeg_name + '+iters=' + NUM_ITERATIONS.toString() + '+K=' + K.toString() + '+datetime=' + time + ' ' + i + '.png')
  getPixelsAsync(RESIZED_PATH)
    .then(function(pixels) {
      var vectors = formatPixels(pixels.data);
      pixels.data = kMeans(vectors);
      savePixelsAsImage(pixels);
    })
    .catch(function(err) {
      console.error(err)
    })
}

function formatPixels(pixelData) {
  var vectors = _.chunk(pixelData, 4);
  return _.map(vectors, function(vector){
    return {
      vector: vector,
      C: null
    };
  });
}

function savePixelsAsImage(pixels) {
  savePixels(pixels, 'png').pipe(newImage);
}

