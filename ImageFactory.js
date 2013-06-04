/**
  * ImageFactory 0.0.1
  *
  * Library for Appcelerator Titanium
  *
  * Copyright 2013: Prut Udomwattawee
  * Licensed under the MIT.
  */

function ImageFactory(imageView, cropView) {
    if(arguments.length !== 2) {
        throw 'Please pass "imageView" and "cropView" reference as Parameters in ImageFactory';
    }
    this.imageView = imageView;
    this.cropView = cropView;

    this.isPinch = false;
    this.isZoom = false;

    this.defaultWidth = this.imageView.width - this.cropView.width;
    this.defaultHeight = this.imageView.height - this.cropView.height;

    this.imgMaxWidth = this.imageView.width;
    this.imgMaxHeight = this.imageView.height;
    this.imgMinWidth = this.imageView.width;
    this.imgMinHeight = this.imageView.height;
}

//===== Setter =====//

ImageFactory.prototype.setImgMaxWidth = function(number) {
    this.imgMaxWidth = number;
}

ImageFactory.prototype.setImgMaxHeight = function(number) {
    this.imgMaxHeight = number;
}

ImageFactory.prototype.setImgMinWidth = function(number) {
    this.imgMinWidth = number;
}

ImageFactory.prototype.setImgMinHeight = function(number) {
    this.imgMinHeight = number;
}

//===== Public Methods =====//

ImageFactory.prototype.setImage = function(imgPath) {
    if(arguments.length != 1) {
        throw 'Please pass an "img path" as Parameters in ImageFactory::setImage';
    }
    this.imageView.image = imgPath;
    this.imgMaxWidth = this.imageView.width;
    this.imgMaxHeight = this.imageView.height;
    this.imageView.left = 0;
    this.imageView.top = 0;
};

// Bind a click event to crop the image
ImageFactory.prototype.cropImage = function(obj) {
    if(arguments.length != 1) {
        throw 'Please pass an "object" to bind with click event as Parameters in ImageFactory::cropImage';
    }
    var that = this;
    obj.addEventListener('click', function(e) {
        var imgWidth = that.cropView.width,
        imgHeight = that.cropView.height,
        imgLeft = that.cropView.animatedCenter.x - that.cropView.width / 2,
        imgTop = that.cropView.animatedCenter.y - that.cropView.height / 2,
        bgColor = that.cropView.borderColor;

        // Ti.API.info("Crop : Image Prop " + imgWidth +"," + imgHeight + " Loc: (" + imgLeft + "," + imgTop + ")");
        // Save into Memory
        that.cropView.borderColor = "transparent";
        var blob = that.imageView.toImage(),
        croped = blob.imageAsCropped({
            x : imgLeft,
            y : imgTop,
            height : imgHeight,
            width : imgWidth
        });
        that.imageView.image = croped;
        that.cropView.borderColor = bgColor;
    });
};

// Bind a click event to capture the camera
ImageFactory.prototype.setupCameraEvent = function(obj) {
    if(arguments.length != 1) {
        throw 'Please pass an "object" to bind with click event as Parameters in ImageFactory::setupCameraEvent';
    }
    var that = this;
    obj.addEventListener('click', function(e) {
        var cameraOptions = {
            success : function(e) {
                var cropRect = e.cropRect || {};

                // To be used when, allowEditing === true
                cropRect.width = cropRect.width || 'Not Set';
                cropRect.height = cropRect.height || 'Not Set';

                // Ti.API.info("Image Capture Event: Image (" + e.media.width +"," + e.media.height + ")");
                // Ti.API.info("Crop : Image (" + cropRect.width +"," + cropRect.height + ")");

                // set image on window
                that.imageView.image = e.media;

                that.imgMaxWidth = e.media.width;
                that.imgMaxHeight = e.media.height;
                that.imageView.left = 0;
                that.imageView.top = 0;
                that.isZoom = false;
            },
            cancel : function() {
                // cancel and close window
            },
            error : function(error) {
                var a = Ti.UI.createAlertDialog({
                    title : "Camera Error"
                });
                if (error.code == Ti.Media.NO_CAMERA) {
                    a.setMessage("MISSING CAMERA");
                } else {
                    a.setMessage('Unexpected error: ' + error.code);
                }
                a.show();
            },
            saveToPhotoGallery : false,
            allowEditing : false,
            animated : true,
            mediaTypes : [Ti.Media.MEDIA_TYPE_PHOTO]
            };

        // display camera OR gallery
        if (Ti.Media.isCameraSupported) {
            Ti.Media.showCamera(cameraOptions);
        } else {
            Ti.Media.openPhotoGallery(cameraOptions);
        }
    });
}

ImageFactory.prototype.setupImageFactoryEvent = function() {
    var that = this;

    //===== cropView =====//

    // Touch Start Event
    this.cropView.addEventListener('touchstart', function(e) {
        // Ti.API.info("==============================================");
        // Ti.API.info("Touch Start: X:" + e.x + " Y:" + e.y);
        // Ti.API.info("Touch Start Animated Center: X:" + that.cropView.animatedCenter.x + " Y:" + that.cropView.animatedCenter.y);
    });

    // Touch Move Event
    this.cropView.addEventListener('touchmove', function(e) {
        if(that.isPinch) {
            return;
        }

        // Crop Region Dimensions
        var offSetX = that.imageView.width - that.cropView.width,
        offSetY = that.imageView.height - that.cropView.height,
        aMidX = that.cropView.animatedCenter.x,
        aMidY = that.cropView.animatedCenter.y,
        midX = that.cropView.width / 2,
        midY = that.cropView.height / 2,
        maxX = midX + offSetX,
        maxY = midY + offSetY,
        cropLeft = aMidX - midX,
        cropTop = aMidY - midY,
        movedX = e.x + cropLeft,
        movedY = e.y + cropTop;

        // Set the boundary for cropView (Not to pass outside the main image)
        // X Position
        if (movedX < midX) {
            movedX = midX;
        }
        else if (movedX > maxX) {
            movedX = maxX;
        }
        // Y Position
        if (movedY < midY) {
            movedY = midY;
        }
        else if (movedY > maxY) {
            movedY = maxY;
        }

        // Check to see if this is zoomed
        // Ti.API.info("============================");
        // Ti.API.info("Loc to: Image (" + that.imageView.left +"," + that.imageView.top + ")");
        // Ti.API.info("Loc to: OffSet (" + that.defaultWidth +"," + that.defaultHeight + ")");
        // Ti.API.info("Loc to: Max (" + maxX +"," + maxY + ")");
        // Ti.API.info("Loc to: Crop (" + cropLeft +"," + cropTop + ")");
        if(that.isZoom) {
            var leftOffSet = cropLeft + that.imageView.left,
            topOffSet = cropTop + that.imageView.top;
            // Ti.API.info("Left OffSet = " + leftOffSet + " Top OffSet = " + topOffSet);
            if(leftOffSet < 0 && that.imageView.left !== 0) {
                that.imageView.left -= leftOffSet;
            }
            else if(leftOffSet > that.defaultWidth) {
                that.imageView.left -= (leftOffSet - that.defaultWidth);
            }
            if(topOffSet < 0 && that.imageView.top !== 0) {
                that.imageView.top -= topOffSet;
            }
            else if(topOffSet > that.defaultHeight) {
                that.imageView.top -= (topOffSet - that.defaultHeight);
            }
        }

        that.cropView.animate({
            center : {
                x : movedX,
                y : movedY
            },
            duration : 1
        }, function(e) {
            // Ti.API.info("Image Capture Size: Image (" + that.imageView.left +"," + that.imageView.top + ")");
        });
    });

    // Gestures Event (Image Resize)
    // pinch Event
    this.imageView.addEventListener('pinch', function(e) {
        that.isPinch = true;
        that.isZoom = true;

        var newWidth = that.imageView.width * e.scale,
        newHeight = that.imageView.height * e.scale;

        // Check to see the resolution more than expected
        // X Position
        if (newWidth < that.imgMinWidth) {
            newWidth = that.imgMinWidth;
        }
        else if (newWidth > that.imgMaxWidth) {
            newWidth = that.imgMaxWidth;
        }
        // Y Position
        if (newHeight < that.imgMinHeight) {
            newHeight = that.imgMinHeight;
        }
        else if (newHeight > that.imgMaxHeight) {
            newHeight = that.imgMaxHeight;
        }

        if(newWidth === that.imgMinWidth || newHeight === that.imgMinHeight) {
            that.isZoom = false
        }

        // Set Center
        // Ti.API.info("Set Center W: " + newWidth + " imgMinWidth: " + that.imgMinWidth);
        // Ti.API.info("Set Center H: " + newHeight + " imgMinWidth: " + that.imgMinHeight);
        that.imageView.left = (that.imgMinWidth - newWidth) / 2;
        that.imageView.top = (that.imgMinHeight - newHeight) / 2;

        // Set the new Image Size
        that.imageView.applyProperties({
            width: Math.round(newWidth),
            height: Math.round(newHeight)
        });

        that.cropView.animate({
            center : {
                x : that.imageView.width / 2,
                y : that.imageView.height / 2
            },
            duration : 1
        }, function(e) {
            that.isPinch = false;
        });

        // Ti.API.info("Touch Start: X:" + that.imageView.width / 2 + " Y:" + that.imageView.height / 2);
    });

};

module.exports = ImageFactory;
