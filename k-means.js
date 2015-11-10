var fs = require('fs'), 
    gm = require('gm').subClass({imageMagick: true});;

gm('./israel.jpg')
  .resize(100, 100)
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

var K = 2;
var centroids = generateKRandomCentroids(K, 4, 0, 255)
var assignedMs;

var newImage = fs.createWriteStream('new.png')

getPixels('./resize.png', function(err, pixels) {
  if (err) {
    console.log('err', err)
    return;
  }
  console.log('OLDLENGTH', pixels.data.length)
  var ms = formatPixels(pixels.data);
  // for (var i = 0; i < 5; i++) { // arbitrary
    // console.log(i)
    assignedMs = assignMsToClosestCentroids(ms, centroids);
    console.log('assignedMs', assignedMs[0])
    console.log('CENTROIDS', centroids)
    centroids = findKMeans(assignedMs);
    console.log('CENTROIDS', centroids)
  // } OUTSIDE THE LOOP
  newPixels = _.chain(assignedMs)
    .map(function(m) {
      return centroids[m.C] // don't parseInt here; do it when centroid coordinates are assigned;
    })
    .flatten()
    .value();
    pixels.data = newPixels;
  // console.log(pixels.data[0])
  // console.log(pixels.data[1])
  // console.log(pixels.data[2])
  // console.log(pixels.data[3])
  // console.log(pixels.data[4])
  // console.log(pixels.data[5])
  console.log('NEWLENGTH', pixels.data.length)
  savePixels(pixels, 'png').pipe(newImage);
})

function findKMeans(ms) {
  console.log('finding means...')
  // return _.chain(ms)
  //   .groupBy(function(m) {
  //     return m.C;
  //   })
  //   .map(function(val, key) {
  //     var vectors = _.map(val, function(arr) {
  //         return arr.vector;
  //       });
  //     console.log(mean(vectors))
  //     return {
  //       vector: mean(vectors),
  //       id: key
  //     }
  //   })
  //   .value()

    var grouped = _.groupBy(ms, function(m) {
      return m.C;
    })

    var keyed = _.mapValues(grouped, function(val) {
      // console.log('val', val)
      var vectors = _.map(val, function(arr) {
          return arr.vector;
        });
      // console.log(vectors)
      return mean(vectors);
    });
    // console.log(keyed)
    return keyed;
}

function findClosestCentroid(m, centroids) {
  return _.reduce(centroids, function(assignedCentroid, centroid) {
    if (magnitude(difference(assignedCentroid.vector, m.vector)) < magnitude(difference(centroid.vector, m.vector))) {
      return centroid;
    }
    return assignedCentroid;;
  }).id;
}

function assignMsToClosestCentroids(ms, centroids) {
  console.log('assigning ms...')
  return _.map(ms, function(m, i) {
    // console.log('finding closest centroid to pixel #', i)
      m.C = findClosestCentroid(m, centroids);
      return m;
    });
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
      id: i.toString()
    });
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


// var x = zeros([32, 32])
// x.set(16, 16, 255)
 
//Save to a file 
// savePixels(x, "png").pipe(process.stdout)