# K-means for image compression

## Summary
This is an implementation of the [k-means clustering algorithm](https://en.wikipedia.org/wiki/K-means_clustering). Image pixels are represented as 4-dimensional vectors (r,g,b,a) and each pixel is ultimately assigned to one of **k** clusters. Because the cluster [centroids](https://en.wikipedia.org/wiki/Centroid) are initialized on random pixels, the final image is different on each run.

## How to use
After cloning the repo, `npm install`. You may need to install [ImageMagick](http://www.imagemagick.org/script/index.php), which is easiest done with [Homebrew](http://brew.sh/). Drop a `.jpg` image into the repo, and configure the variables `jpeg_name`, `NUM_ITERATIONS`, and `k` in `k-means.js` accordingly. Then run `node k-means.js` to transform your image!

## Disclaimer
The code and this README are both works-in-progress. Feel free to contact me with suggestions!
