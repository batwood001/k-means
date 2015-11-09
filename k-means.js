var fs = require('fs'), 
    gm = require('gm').subClass({imageMagick: true});;

gm('./israel.jpg')
  .resize(200, 200)
  .write('./resize.png', function (err) {
    if (err) console.log('error:', err);
    console.log('done')
  })

// gm('./israel.jpg')
//   .identify(function (err, data) {
//     if (!err) console.log('data', data)
//     console.log(err)
//   });
 

var getPixels = require('get-pixels'),
    savePixels = require('save-pixels'),
    fs = require('fs'),
    _ = require('lodash');

var K = 5;
var centroids = generateKRandomCentroids(K, 4, 0, 255)


var newImage = fs.createWriteStream('new.png')

getPixels('./resize.png', function(err, pixels) {
  if (err) {
    console.log('err', err)
    return;
  }

  var ms = formatPixels(pixels.data);
  // repeat until convergence:
    var assignedMs = _.map(ms, function(m) {
      m.C = findClosestCentroid(m, centroids);
      return m;
    })
    console.log(assignedMs)
      // map over assigned m's; 
    

  savePixels(pixels, 'png').pipe(newImage);
})

function findClosestCentroid(m, centroids) {
  return _.reduce(centroids, function(assignedCentroid, centroid) {
    if (magnitude(difference(assignedCentroid.vector, m.vector)) < magnitude(difference(centroid.vector, m.vector))) {
      return centroid;
    }
    return assignedCentroid;;
  }).id;
}

function formatPixels(pixelData) {
  var vectors = _.chunk(pixelData, 4);
  return _.map(vectors, function(vector){
    return {
      vector: vector,
      C: null
    }
  })
}

function emptyVector(length) {
  var vector = [];
  for (var i = 0; i < length; i++) {
    vector.push(0);
  }
  return vector
}

function generateKRandomCentroids(K, dimension, min, max) {
  var centroids = [];
  for (var i = 0; i < K; i++) {
    var vector = _.map(emptyVector(dimension), function(dim) {
      return getRandomInt(min, max);
    })
    centroids.push({
      vector: vector,
      id: i
    });
  }
  return centroids;
}

function getRandomInt(min, max) {
  return parseInt(Math.random() * (max + 1 - min) + min);
}

 
function difference(vector1, vector2) {
  return _.chain(vector1)
    .zip(vector2)
    .map(function(el) {
      return el[0] - el[1];
    })
    .flatten()
    .value()
}

function dot(vector1, vector2) {
  return _.chain(vector1)
    .zip(vector2)
    .map(function(el) {
      return el[0] * el[1];
    })
    .flatten()
    .reduce(function(sum, curr) {
      return sum + curr;
    })
    .value()
}

function magnitude(vector) {
  return Math.sqrt(dot(vector, vector));
}

function mean(vectors) {
  return _.chain(vectors)
    .zip()
    .map(function(dimension) {
      return _.reduce(dimension, function(acc, curr){
        return acc * curr;
      }) / dimension.length;
    })
    .value();
}


// var x = zeros([32, 32])
// x.set(16, 16, 255)
 
//Save to a file 
// savePixels(x, "png").pipe(process.stdout)