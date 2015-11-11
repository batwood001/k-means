var fs = require('fs'), 
    gm = require('gm').subClass({imageMagick: true});;

var time = new Date();

gm('./tree.jpg')
  .resize(400, 400)
  .write('./resize.png' + time, function (err) {
    if (err) console.log('error:', err);
    console.log('done')
  })

var getPixels = require('get-pixels'),
    savePixels = require('save-pixels'),
    fs = require('fs'),
    _ = require('lodash');

var K = 5;
var assignedMs;

var newImage = fs.createWriteStream('tree' + time + '.png')

getPixels('./resize.png', function(err, pixels) {
  if (err) {
    console.log('err', err)
    return;
  }
  console.log('OLDLENGTH', pixels.data.length)
  var ms = formatPixels(pixels.data);
  var centroids = generateKRandomCentroids(K, ms)
  // for (var i = 0; i < 5; i++) {
    assignedMs = assignMsToClosestCentroids(ms, centroids);
    centroids = findKMeans(assignedMs);
    console.log(centroids)
  // }
  newPixels = _.chain(assignedMs)
    .map(function(m) {
      return centroids[m.C];
    })
    .flatten()
    .value();
    pixels.data = newPixels;
  console.log('NEWLENGTH', pixels.data.length)
  savePixels(pixels, 'png').pipe(newImage);
})

function findKMeans(ms) {
  console.log('finding means...')
  return _.chain(ms)
    .groupBy(function(m) {
      return m.C;
    })
    .mapValues(function(val) {
      var vectors = _.map(val, function(arr) {
        return arr.vector;
      });
      return mean(vectors);
    })
    .value();
}

function findClosestCentroid(m, centroids) {
  return _.reduce(centroids, function(assignedCentroid, centroid) {
    if (magnitude(difference(m.vector, assignedCentroid.vector)) > magnitude(difference(m.vector, centroid.vector))) {
      return centroid;
    }
    return assignedCentroid;
  });
}

function assignMsToClosestCentroids(ms, centroids) {
  console.log('assigning ms...')
  return _.map(ms, function(m, i) {
    // console.log('finding closest centroid to pixel #', i)
      m.C = findClosestCentroid(m, centroids).id;
      return m;
    });
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

function generateKRandomCentroids(K, data) {
  var centroids = [];
  var used = {};

  for (var i = 0; i < K; i++) {
    var idx = getRandomInt(0, data.length);
    while (used[idx]) {
      idx = getRandomInt(0, data.length);
    }
    centroids.push({
      vector: data[idx].vector,
      id: i.toString()
    });
    used[idx] = true;
  }
  return centroids;
}

function getRandomInt(min, max) {
  return parseInt(Math.random() * (max + 1 - min) + min);
}

 
function difference(vector1, vector2) {
  return _.zipWith(vector1, vector2, function(a, b) {
    return a - b;
  });
}

function dot(vector1, vector2) {
  return _.chain(vector1)
    .zipWith(vector2, function(a, b) {
      return a * b;
    })
    .reduce(function(sum, curr) {
      return sum + curr;
    })
    .value()
}

function magnitude(vector) {
  return Math.sqrt(dot(vector, vector));
}

function mean(vectors) {
  var zipped = _.zip.apply(null, vectors);
  return _.map(zipped, function(dimension) {
    return _.reduce(dimension, function(acc, curr){
      return acc + curr;
    }) / dimension.length;
  })
}