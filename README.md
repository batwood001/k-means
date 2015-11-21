# K-means for image compression

## Summary
This is an implementation of the [k-means clustering algorithm](https://en.wikipedia.org/wiki/K-means_clustering). Image pixels are represented as 4-dimensional vectors (r,g,b,a) and each pixel is ultimately assigned to one of **k** clusters. Because the cluster [centroids](https://en.wikipedia.org/wiki/Centroid) are initialized on random pixels, the final image is different on each run.

## How to use
After cloning the repo, `npm install`. You may need to install [ImageMagick](http://www.imagemagick.org/script/index.php), which is easiest done with [Homebrew](http://brew.sh/). Drop a `.jpg` image into the directory, and configure the variables `jpeg_name`, `NUM_ITERATIONS`, and `k` in `k-means.js` accordingly. Then run `node k-means.js` to transform your image!

## Results

An interesting pattern emerged while generating k-means'd versions of my profile picture. In 10 runs of the algorithm, with 10 iterations each and K=3, the algorithm appeared to converge at only one of two local optima:
![Alt text](images/10_3/israel+iters=10+K=3+datetime=Fri Nov 20 2015 23:23:10 GMT-0600 (CST).png "Title")
![Alt text](images/10_3/israel+iters=10+K=3+datetime=Fri Nov 20 2015 23:24:54 GMT-0600 (CST).png "Title")

(See the [images/10_3/](images/10_3/) directory for all 10 runs).

## Disclaimer
The code and this README are both works-in-progress. Feel free to contact me with suggestions!
