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
    self = this;
    self.imageView = imageView;
    self.cropView = cropView;

    self.isPinch = false;
    self.isZoom = false;

    self.defaultWidth = self.imageView.width - self.cropView.width;
    self.defaultHeight = self.imageView.height - self.cropView.height;

    self.imgMaxWidth = self.imageView.width;
    self.imgMaxHeight = self.imageView.height;
    self.imgMinWidth = self.imageView.width;
    self.imgMinHeight = self.imageView.height;
}

//===== Setter =====//

ImageFactory.prototype.setImgMaxWidth = function(number) {
    self.imgMaxWidth = number;
}

ImageFactory.prototype.setImgMaxHeight = function(number) {
    self.imgMaxHeight = number;
}

ImageFactory.prototype.setImgMinWidth = function(number) {
    self.imgMinWidth = number;
}

ImageFactory.prototype.setImgMinHeight = function(number) {
    self.imgMinHeight = number;
}

//===== Public Methods =====//

ImageFactory.prototype.setImage = function(imgPath) {
    if(arguments.length != 1) {
        throw 'Please pass an "img path" as Parameters in ImageFactory::setImage';
    }
    self.imageView.image = imgPath;
    self.imgMaxWidth = self.imageView.width;
    self.imgMaxHeight = self.imageView.height;
    self.imageView.left = 0;
    self.imageView.top = 0;
};

// Bind a click event to crop the image
ImageFactory.prototype.cropImage = function(obj) {
    if(arguments.length != 1) {
        throw 'Please pass an "object" to bind with click event as Parameters in ImageFactory::cropImage';
    }
    obj.addEventListener('click', function(e) {
        var imgWidth = self.cropView.width,
        imgHeight = self.cropView.height,
        imgLeft = self.cropView.animatedCenter.x - self.cropView.width / 2,
        imgTop = self.cropView.animatedCenter.y - self.cropView.height / 2,
        bgColor = self.cropView.borderColor;

        // Ti.API.info("Crop : Image Prop " + imgWidth +"," + imgHeight + " Loc: (" + imgLeft + "," + imgTop + ")");
        // Save into Memory
        self.cropView.borderColor = "transparent";
        var blob = self.imageView.toImage(),
        croped = blob.imageAsCropped({
            x : imgLeft,
            y : imgTop,
            height : imgHeight,
            width : imgWidth
        });
        self.imageView.image = croped;
        self.cropView.borderColor = bgColor;
    });
};

// Bind a click event to capture the camera
ImageFactory.prototype.setupCameraEvent = function(obj) {
    if(arguments.length != 1) {
        throw 'Please pass an "object" to bind with click event as Parameters in ImageFactory::setupCameraEvent';
    }

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
                self.imageView.image = e.media;

                self.imgMaxWidth = e.media.width;
                self.imgMaxHeight = e.media.height;
                self.imageView.left = 0;
                self.imageView.top = 0;
                self.isZoom = false;
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
    //===== cropView =====//

    // Touch Start Event
    self.cropView.addEventListener('touchstart', function(e) {
        // Ti.API.info("==============================================");
        // Ti.API.info("Touch Start: X:" + e.x + " Y:" + e.y);
        // Ti.API.info("Touch Start Animated Center: X:" + self.cropView.animatedCenter.x + " Y:" + self.cropView.animatedCenter.y);
    });

    // Touch Move Event
    self.cropView.addEventListener('touchmove', function(e) {
        if(self.isPinch) {
            return;
        }

        // Crop Region Dimensions
        var offSetX = self.imageView.width - self.cropView.width,
        offSetY = self.imageView.height - self.cropView.height,
        aMidX = self.cropView.animatedCenter.x,
        aMidY = self.cropView.animatedCenter.y,
        midX = self.cropView.width / 2,
        midY = self.cropView.height / 2,
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
        // Ti.API.info("Loc to: Image (" + self.imageView.left +"," + self.imageView.top + ")");
        // Ti.API.info("Loc to: OffSet (" + self.defaultWidth +"," + self.defaultHeight + ")");
        // Ti.API.info("Loc to: Max (" + maxX +"," + maxY + ")");
        // Ti.API.info("Loc to: Crop (" + cropLeft +"," + cropTop + ")");
        if(self.isZoom) {
            var leftOffSet = cropLeft + self.imageView.left,
            topOffSet = cropTop + self.imageView.top;
            // Ti.API.info("Left OffSet = " + leftOffSet + " Top OffSet = " + topOffSet);
            if(leftOffSet < 0 && self.imageView.left !== 0) {
                self.imageView.left -= leftOffSet;
            }
            else if(leftOffSet > self.defaultWidth) {
                self.imageView.left -= (leftOffSet - self.defaultWidth);
            }
            if(topOffSet < 0 && self.imageView.top !== 0) {
                self.imageView.top -= topOffSet;
            }
            else if(topOffSet > self.defaultHeight) {
                self.imageView.top -= (topOffSet - self.defaultHeight);
            }
        }

        self.cropView.animate({
            center : {
                x : movedX,
                y : movedY
            },
            duration : 1
        }, function(e) {
            // Ti.API.info("Image Capture Size: Image (" + self.imageView.left +"," + self.imageView.top + ")");
        });
    });

    // Gestures Event (Image Resize)
    // pinch Event
    self.imageView.addEventListener('pinch', function(e) {
        self.isPinch = true;
        self.isZoom = true;

        var newWidth = self.imageView.width * e.scale,
        newHeight = self.imageView.height * e.scale;

        // Check to see the resolution more than expected
        // X Position
        if (newWidth < self.imgMinWidth) {
            newWidth = self.imgMinWidth;
        }
        else if (newWidth > self.imgMaxWidth) {
            newWidth = self.imgMaxWidth;
        }
        // Y Position
        if (newHeight < self.imgMinHeight) {
            newHeight = self.imgMinHeight;
        }
        else if (newHeight > self.imgMaxHeight) {
            newHeight = self.imgMaxHeight;
        }

        if(newWidth === self.imgMinWidth || newHeight === self.imgMinHeight) {
            self.isZoom = false
        }

        // Set Center
        // Ti.API.info("Set Center W: " + newWidth + " imgMinWidth: " + self.imgMinWidth);
        // Ti.API.info("Set Center H: " + newHeight + " imgMinWidth: " + self.imgMinHeight);
        self.imageView.left = (self.imgMinWidth - newWidth) / 2;
        self.imageView.top = (self.imgMinHeight - newHeight) / 2;

        // Set the new Image Size
        self.imageView.applyProperties({
            width: Math.round(newWidth),
            height: Math.round(newHeight)
        });

        self.cropView.animate({
            center : {
                x : self.imageView.width / 2,
                y : self.imageView.height / 2
            },
            duration : 1
        }, function(e) {
            self.isPinch = false;
        });

        // Ti.API.info("Touch Start: X:" + self.imageView.width / 2 + " Y:" + self.imageView.height / 2);
    });

};

module.exports = ImageFactory;
