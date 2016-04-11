// Started at 11:28am
// 11:58am - Can drag and drop an image and have it render to a canvas.
// 1:13pm - Extracts my guess at a best color. Looks pretty good. Now to clean up UI.
// 1:44pm - Very happy with UI behavior. Would love to guess text colors.
// 2:10pm - Flipping between black and white text based on luminance of background color. Calling it good enough. :-)
var App;
(function (App) {
    function process(canvas, context) {
        // Image data is a 1D array of pixel values repeating in RGB.
        // pixel N is { r: imageData[4n + 0], g: imageData[4n + 1], b: imageData[4n + 2] }
        // Getting 12^2 average RGBs
        var segments = 12, moreRed = [], moreGreen = [], moreBlue = [], moreGray = [];
        for (var r = 0; r < segments; r++) {
            for (var c = 0; c < segments; c++) {
                var sx = Math.floor(canvas.width / segments) * c, sy = Math.floor(canvas.height / segments) * r, w = Math.floor(canvas.width / segments), h = Math.floor(canvas.height / segments), avg = averageRgb(context.getImageData(sx, sy, w, h));
                // Bucket based on dominance of RGB (with a gray fallback)
                var winBy = 255 * 0.05; // To go in a bucket, it must win by 5%
                if (avg.r > avg.b + winBy && avg.r > avg.g + winBy) {
                    moreRed.push(avg);
                }
                else if (avg.g > avg.r + winBy && avg.g > avg.b + winBy) {
                    moreGreen.push(avg);
                }
                else if (avg.b > avg.r + winBy && avg.b > avg.g + winBy) {
                    moreBlue.push(avg);
                }
                else {
                    moreGray.push(avg);
                }
            }
        }
        // At this point, we have averages RGBs for each image segment in buckets
        // by which color dominated the other two colors.
        // Red was usually the most dominant color
        var sortedBucket;
        if (moreRed.length > moreGreen.length && moreRed.length > moreBlue.length && moreRed.length > moreGray.length) {
            sortedBucket = sortBucket(moreRed, "r");
        }
        else if (moreGreen.length > moreRed.length && moreGreen.length > moreBlue.length && moreGreen.length > moreGray.length) {
            sortedBucket = sortBucket(moreGreen, "g");
        }
        else if (moreBlue.length > moreRed.length && moreBlue.length > moreGreen.length && moreBlue.length > moreGray.length) {
            sortedBucket = sortBucket(moreBlue, "b");
        }
        else {
            // gray was most dominant. Boring...
            sortedBucket = moreGray;
        }
        // THEORY: the median of sortedBucket is the best color
        var bestRgb = sortedBucket[Math.floor(sortedBucket.length / 2)];
        document.body.style.backgroundColor = rgbToString(bestRgb);
        if (luminance(bestRgb) < 40000) {
            document.body.className = "lightText";
        }
        else {
            document.body.className = "darkText";
        }
    }
    App.process = process;
    function sortBucket(arr, field) {
        return arr.sort(function (a, b) {
            return a[field] - b[field];
        });
    }
    /** Given an ImageData array, find the average RGB and return it */
    function averageRgb(imageData) {
        var i = 0, r = 0, g = 0, b = 0;
        while (i < imageData.data.length) {
            r += imageData.data[i++];
            g += imageData.data[i++];
            b += imageData.data[i++];
            i++;
        }
        var avg = {
            r: Math.floor(r / (imageData.data.length / 4)),
            g: Math.floor(g / (imageData.data.length / 4)),
            b: Math.floor(b / (imageData.data.length / 4))
        };
        return avg;
    }
    function rgbToString(obj) {
        return "rgb(" + obj.r + ", " + obj.g + ", " + obj.b + ")";
    }
    // according to http://www.w3.org/TR/2015/NOTE-WCAG20-TECHS-20150226/G18
    function luminance(obj) {
        var R = luminanceHelper(obj.r);
        var G = luminanceHelper(obj.g);
        var B = luminanceHelper(obj.b);
        return 0.2126 * R + 0.7152 * G + 0.0722 * B;
    }
    function luminanceHelper(n) {
        return (n <= 0.03928) ? n / 12.92 : Math.pow(((n + 0.055) / 1.055), 2.4);
    }
})(App || (App = {}));
// dropping code borrowed HEAVILY from http://www.html5rocks.com/en/tutorials/file/dndfiles/ 
var dropZone = document.getElementById('drop_zone');
dropZone.addEventListener('dragover', function (evt) {
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
}, false);
dropZone.addEventListener('drop', function handleFileSelect(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    var files = evt.dataTransfer.files, canvas = document.getElementById("canvas"), ctx = canvas.getContext('2d'), fr = new FileReader();
    fr.onload = function () {
        var img = document.querySelector("#image");
        img.onload = function () {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            App.process(canvas, ctx);
        };
        img.src = arguments[0].currentTarget.result;
        img.style.display = "block";
    };
    fr.readAsDataURL(files[0]);
}, false);
//# sourceMappingURL=app.js.map