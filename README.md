#Titanium-ImageFactory

Image Manipulation Library for Appcelerator Titanium

## How to use

* Create "lib" folder under "app" folder ( app/lib )
* Add "ImageFactory.js" in "lib" folder that just created
* Follow example below,

### Alloy
* In your view (*.xml), simply prepare the mark up as follow

```
	<View id="image_wrapper">
		<ImageView id="image">
			<View id="crop_view"></View>
        </ImageView>
    </View>
    <Button id="photo_button"  ></Button>
	<Button id="crop_button"  ></Button>
```

* In your stylesheet (*.tss), adjust the width and height to match what you need

```
	"#image_wrapper": {
		top: 10,
		width: '250',
		height: '300'
	},
	"#image" : {
		width: '250',
		height: '300'
	},
	"#crop_view" : {
		borderRadius: "5",
		borderWidth: "1",
		borderColor: "red",
		width: "150",
		height: "200"
	},
	"#photo_button" : {
		bottom: "10",
		title: "Add Image",
		left: 5
	},
	"#crop_button" : {
		bottom: "10",
		title: "Crop Image",
		right: 5
	}
```

* In your controller (*.js), will call ImageFactory Library

```
	var ImageFactory = require('ImageFactory');
	var imageFactoryObject = new ImageFactory($.image, $.crop_view);
	imageFactoryObject.setDefaultImage('/images/burglar.png');
	imageFactoryObject.setCropImageEvent($.crop_button);
	imageFactoryObject.setCameraEvent($.photo_button);
	imageFactoryObject.setImageFactoryEvents();
```

## Note:

* If the program cannot find this library, please clean your project first then rerun it again.

## Version

### 0.0.1
* Beta Release