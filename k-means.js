var _ = require('lodash'),
    config = require('./config');

var K = config.K;
var NUM_ITERATIONS = config.NUM_ITERATIONS;

module.exports.kMeans = function(ms) {
  var centroids = generateKRandomCentroids(K, ms)
  console.log('initial centroids:', centroids)

  for (var i = 0; i < NUM_ITERATIONS; i++) {
    console.log('iteration # ', i)
    console.time('took')
    assignedMs = assignMsToClosestCentroids(ms, centroids);
    centroids = findKMeans(assignedMs);
    console.timeEnd('took')
  }
  console.log('new centroids:', centroids)

  var newMs = _.chain(assignedMs)
    .map(function(m) {
      return centroids[m.C];
    })
    .flatten()
    .value();
  
  return newMs;
}

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