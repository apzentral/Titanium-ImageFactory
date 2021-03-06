/**
 * ImageFactory 0.0.2
 *
 * Library for Appcelerator Titanium
 *
 * Copyright 2013: Prut Udomwattawee
 * Licensed under the MIT.
 */

function ImageFactory(imageView, cropView) {
    if (arguments.length !== 2) {
        throw 'Please pass "imageView" and "cropView" reference as Parameters in ImageFactory';
    }
    this.imageView = imageView;
    this.cropView = cropView;

    this.isPinch = false;
    this.isZoom = false;

    // Convert Units
    this.imageView.width = this.parseImgUnit(this.imageView.width);
    this.imageView.height = this.parseImgUnit(this.imageView.height);

    this.cropView.width = this.parseImgUnit(this.cropView.width);
    this.cropView.height =this.parseImgUnit(this.cropView.height);

    // Set The Properties
    this.defaultWidth = this.imageView.width - this.cropView.width;
    this.defaultHeight = this.imageView.height - this.cropView.height;

    this.imgMaxWidth = this.imageView.width;
    this.imgMaxHeight = this.imageView.height;
    this.imgMinWidth = this.imageView.width;
    this.imgMinHeight = this.imageView.height;

    // Set the Options
}

//===== Setter =====//

ImageFactory.prototype.setImgMaxWidth = function (number) {
    this.imgMaxWidth = number;
}

ImageFactory.prototype.setImgMaxHeight = function (number) {
    this.imgMaxHeight = number;
}

ImageFactory.prototype.setImgMinWidth = function (number) {
    this.imgMinWidth = number;
}

ImageFactory.prototype.setImgMinHeight = function (number) {
    this.imgMinHeight = number;
}

//===== Public Methods =====//

// Code From :
// http://developer.appcelerator.com/question/125317/calculate-apps-density-pixel-width--height-using-titaniumplatformdisplaycapsdpi
ImageFactory.prototype.pixelsToDPUnits = function (thePixels) {
    thePixels = parseInt(thePixels);
    if ( Titanium.Platform.displayCaps.dpi > 160 ) {
        return (thePixels / (Titanium.Platform.displayCaps.dpi / 160));
    }
    else {
        return thePixels;
    }
}

// Code From :
// http://developer.appcelerator.com/question/125317/calculate-apps-density-pixel-width--height-using-titaniumplatformdisplaycapsdpi
ImageFactory.prototype.dpUnitsToPixels = function (theDPUnits) {
    theDPUnits = parseInt(theDPUnits);
    // Ti.API.info("Before dip unit = " + theDPUnits);
    if ( Titanium.Platform.displayCaps.dpi > 160 ) {
        // Ti.API.info("After dip unit = " + (theDPUnits * (Titanium.Platform.displayCaps.dpi / 160)));
        return (theDPUnits * (Titanium.Platform.displayCaps.dpi / 160));
    }
    else {
        return theDPUnits;
    }
}


// Note: There are
// 1. px
// 2. dip
// 3. in
// 4. mm
// 5. cm
// 6. pt
// We need to remove convert into the correct pixel to perform math
ImageFactory.prototype.parseImgUnit = function (value) {
    // Ti.API.info(" Search = " + value.search('dip'));
    // Ti.API.info("Value = " + value);
    if(value.search('dip') !== -1) {
        // Ti.API.info("converted dip unit = " + this.dpUnitsToPixels(value));
        return parseInt(value);
        // Need to convert to default unit
        // return this.dpUnitsToPixels(value);
    }

    return value;
}

ImageFactory.prototype.setDefaultImage = function (imgPath) {
    if (arguments.length !== 1) {
        throw 'Please pass an "img path" as Parameters in ImageFactory::setImage';
    }
    this.imageView.image = imgPath;
    this.imgMaxWidth = this.imageView.width;
    this.imgMaxHeight = this.imageView.height;
    this.imageView.left = 0;
    this.imageView.top = 0;
};

// Bind a click event to crop the image
ImageFactory.prototype.setCropImageEvent = function (obj) {
    if (arguments.length !== 1) {
        throw 'Please pass an "object" to bind with click event as Parameters in ImageFactory::cropImage';
    }
    var that = this;
    obj.addEventListener('click', function (e) {
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
                x: imgLeft,
                y: imgTop,
                height: imgHeight,
                width: imgWidth
            });

        // Check to see the resolution more than expected
        // X Position
        if (imgWidth < that.imgMinWidth) {
            imgWidth = that.imgMinWidth;
        } else if (imgWidth > that.imgMaxWidth) {
            imgWidth = that.imgMaxWidth;
        }
        // Y Position
        if (imgHeight < that.imgMinHeight) {
            imgHeight = that.imgMinHeight;
        } else if (imgHeight > that.imgMaxHeight) {
            imgHeight = that.imgMaxHeight;
        }

        if (imgWidth === that.imgMinWidth || imgHeight === that.imgMinHeight) {
            that.isZoom = false;
        }

        // Reset to full width and height
        // Ti.API.info("Crop : Apply Prop " + imgWidth +"," + imgHeight);

        that.imageView.applyProperties({
            width: imgWidth,
            height: imgHeight,
            top: 0,
            left: 0
        });

        // Set Image to the view
        that.imageView.image = croped;
        that.cropView.borderColor = bgColor;
    });
};

// Bind a click event to capture the camera
ImageFactory.prototype.setCameraEvent = function (obj) {
    if (arguments.length !== 1) {
        throw 'Please pass an "object" to bind with click event as Parameters in ImageFactory::setupCameraEvent';
    }
    var that = this;
    obj.addEventListener('click', function (e) {
        var cameraOptions = {
            success: function (e) {
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
            cancel: function () {
                // cancel and close window
            },
            error: function (error) {
                var a = Ti.UI.createAlertDialog({
                    title: "Camera Error"
                });
                if (error.code == Ti.Media.NO_CAMERA) {
                    a.setMessage("MISSING CAMERA");
                } else {
                    a.setMessage('Unexpected error: ' + error.code);
                }
                a.show();
            },
            saveToPhotoGallery: false,
            allowEditing: false,
            animated: true,
            mediaTypes: [Ti.Media.MEDIA_TYPE_PHOTO]
        };

        // display camera OR gallery
        if (Ti.Media.isCameraSupported) {
            Ti.Media.showCamera(cameraOptions);
        } else {
            Ti.Media.openPhotoGallery(cameraOptions);
        }
    });
}

ImageFactory.prototype.setImageFactoryEvents = function () {
    var that = this,
        baseWidth = 0,
        baseHeight = 0,
        oldBorder = this.cropView.borderColor;

    // Touch Start Event
    this.cropView.addEventListener('touchstart', function (e) {
        // Ti.API.info("TouchStart");
        // Ti.API.info("==============================================");
        // Ti.API.info("Touch Start: X:" + e.x + " Y:" + e.y);
        // Ti.API.info("Touch Start Animated Center: X:" + that.cropView.animatedCenter.x + " Y:" + that.cropView.animatedCenter.y);

        // Set initial width and height
        baseWidth = that.imageView.width;
        baseHeight = that.imageView.height;
    });

    // Touch End Event
    this.cropView.addEventListener('touchend', function (e) {
        if (that.isPinch) {
            that.isPinch = false;
            that.cropView.borderColor = oldBorder;
        }
    });

    // Touch Move Event
    this.cropView.addEventListener('touchmove', function (e) {
        if (that.isPinch) {
            return;
        }

        // Ti.API.info("Width: " + that.imageView.width + " Height: " + that.imageView.height);

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
        } else if (movedX > maxX) {
            movedX = maxX;
        }
        // Y Position
        if (movedY < midY) {
            movedY = midY;
        } else if (movedY > maxY) {
            movedY = maxY;
        }

        // Check to see if this is zoomed
        // Ti.API.info("============================");
        // Ti.API.info("Loc to: Image (" + that.imageView.left +"," + that.imageView.top + ")");
        // Ti.API.info("Loc to: OffSet (" + that.defaultWidth +"," + that.defaultHeight + ")");
        // Ti.API.info("Loc to: Max (" + maxX +"," + maxY + ")");
        // Ti.API.info("Loc to: Crop (" + cropLeft +"," + cropTop + ")");
        if (that.isZoom) {
            var leftOffSet = cropLeft + that.imageView.left,
                topOffSet = cropTop + that.imageView.top;
            // Ti.API.info("Left OffSet = " + leftOffSet + " Top OffSet = " + topOffSet);
            if (leftOffSet < 0 && that.imageView.left !== 0) {
                that.imageView.left -= leftOffSet;
            } else if (leftOffSet > that.defaultWidth) {
                that.imageView.left -= (leftOffSet - that.defaultWidth);
            }
            if (topOffSet < 0 && that.imageView.top !== 0) {
                that.imageView.top -= topOffSet;
            } else if (topOffSet > that.defaultHeight) {
                that.imageView.top -= (topOffSet - that.defaultHeight);
            }
        }

        that.cropView.animate({
            center: {
                x: movedX,
                y: movedY
            },
            duration: 1
        }, function (e) {
            // Ti.API.info("Image Capture Size: Image (" + that.imageView.left +"," + that.imageView.top + ")");
        });
    });

    // Gestures Event (Image Resize)
    // pinch Event
    this.imageView.addEventListener('pinch', function (e) {
        // Ti.API.info("Pinch");
        that.isPinch = true;
        that.isZoom = true;
        that.cropView.borderColor = "transparent";

        var newWidth = baseWidth * e.scale,
            newHeight = baseHeight * e.scale;

        // Ti.API.info("Pinch: oldBorder = " + oldBorder);

        // Ti.API.info("===========================");
        // Ti.API.info(e);
        // Ti.API.info("e.scale = " + e.scale);
        // Ti.API.info("New = (" + newWidth + "," + newHeight + ")");

        // Check to see the resolution more than expected
        // X Position
        if (newWidth < that.imgMinWidth) {
            newWidth = that.imgMinWidth;
        } else if (newWidth > that.imgMaxWidth) {
            newWidth = that.imgMaxWidth;
        }
        // Y Position
        if (newHeight < that.imgMinHeight) {
            newHeight = that.imgMinHeight;
        } else if (newHeight > that.imgMaxHeight) {
            newHeight = that.imgMaxHeight;
        }

        if (newWidth === that.imgMinWidth || newHeight === that.imgMinHeight) {
            that.isZoom = false;
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
            center: {
                x: that.imageView.width / 2,
                y: that.imageView.height / 2
            },
            duration: 1
        }, function (e) {
            // Ti.API.info("oldBorder = " + oldBorder);
        });

        // Ti.API.info("Touch Start: X:" + that.imageView.width / 2 + " Y:" + that.imageView.height / 2);
    });

};

module.exports = ImageFactory;