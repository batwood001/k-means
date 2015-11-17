var fs = require('fs'), 
    gm = require('gm').subClass({imageMagick: true}),
    getPixels = require('get-pixels'),
    savePixels = require('save-pixels'),
    _ = require('lodash');


/* CONFIGURE */

var K = 5;
var jpeg_name = 'israel';
var NUM_ITERATIONS = 5;

/* END CONFIGURE */

var time = new Date();

gm('./' + jpeg_name + '.jpg')
  .resize(400, 400)
  .write('./resize.png', function (err) {
    if (err) console.log('error:', err);
    console.log('done')
  })


var assignedMs;
var newImage = fs.createWriteStream(jpeg_name + time + '.png')

getPixels('./resize.png', function(err, pixels) {
  if (err) {
    console.log('err', err)
    return;
  }
  var ms = formatPixels(pixels.data);
  var centroids = generateKRandomCentroids(K, ms)
  console.log('initial centroids:', centroids)
  for (var i = 0; i < NUM_ITERATIONS; i++) {
    assignedMs = assignMsToClosestCentroids(ms, centroids);
    centroids = findKMeans(assignedMs);
    console.log('new centroids:', centroids)
  }
  newPixels = _.chain(assignedMs)
    .map(function(m) {
      return centroids[m.C];
    })
    .flatten()
    .value();
    pixels.data = newPixels;

  savePixels(pixels, 'png').pipe(newImage);
})

function findKMeans(ms) {
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
  return _.transform(centroids, function(closest, vector, id) {
    if (magnitude(difference(m.vector, closest.vector)) > magnitude(difference(m.vector, vector))) {
      closest.id = id;
      closest.vector = vector;
    }
  }, {id: '0', vector: centroids[0]});
}

function assignMsToClosestCentroids(ms, centroids) {
  return _.map(ms, function(m) {
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
  var used = {};
  var centroids = {};
  for (var i = 0; i < K; i++) {
    var idx = getRandomInt(0, data.length);
    while (used[idx]) {
      idx = getRandomInt(0, data.length);
    }
    centroids[i] = data[idx].vector;
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