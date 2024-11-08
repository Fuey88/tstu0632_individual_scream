// declare all the global variables
// global variables will be used throughout the functions
let skyShape, waterShape, greenShape, boardwalkShape; // colour map overlays for the left image
let skyFlippedShape, waterFlippedShape, greenFlippedShape, boardwalkFlippedShape; // flipped colour map overlays for the right image
let skyCircles = [], waterCircles = [], greenCircles = [], boardwalkCircles = []; // arrays to store circles for each shape
let imgAspectRatio; // aspect ratio for resizing
let skyColour, waterColour, greenColour, boardwalkColour; // define colours for each shape
let frameCounter = 0; // frame counter to control the animation speed

// preload the images
// these images will be used as a guide for the color map
function preload() {
    screamImg = loadImage("assets/scream.jpg"); // loads but doesn't display
    skyShape = loadImage("assets/skyColourMap.png"); // file for the sky colour map
    waterShape = loadImage("assets/waterColourMap.png"); // path for the water colour map
    greenShape = loadImage("assets/greenColourMap.png"); // path for the green colour map
    boardwalkShape = loadImage("assets/boardwalkColourMap.png"); // path for the boardwalk

    // we're going to create a flipped version of the art
    // to fill up the whole screen
    // added flipped assets using https://flip.imageonline.co/ to add complexity
    skyFlippedShape = loadImage("assets/skyFlippedColourMap.png");
    waterFlippedShape = loadImage("assets/waterFlippedColourMap.png");
    greenFlippedShape = loadImage("assets/greenFlippedColourMap.png");
    boardwalkFlippedShape = loadImage("assets/boardwalkFlippedColourMap.png");
}
function setup() { // for the animation
  frameRate(30); // adjusted to reduce load time
  imgAspectRatio = screamImg.width / screamImg.height; // gets aspect ratio by dividing width and height of image
  resizeCanvasToFitWindow(); // resized canvas
  screamImg.loadPixels(); // got the pixels for the image 'The Scream' Munch (1893)
  skyShape.loadPixels(); // got the pixels for the sky
  waterShape.loadPixels(); // got the pixels for the water
  greenShape.loadPixels(); // got the pixels for the green bush
  boardwalkShape.loadPixels(); // got the pixels for the boardwalk

  // loaded the pixels for the flipped images
  skyFlippedShape.loadPixels(); 
  waterFlippedShape.loadPixels();
  greenFlippedShape.loadPixels();
  boardwalkFlippedShape.loadPixels();

  // sets the colour for the sky, water, green, boardwalk
  skyColour = color(255, 116, 2); // orange colour for the sky
  waterColour = color(2, 2, 255); // blue colour for the water
  greenColour = color(30, 255, 0); // green colour for the bushes
  boardwalkColour = color(153, 43, 0); // brown colour for the boardwalk

  // initialized circles for the original and flipped images
  initializeCircles(skyCircles, skyShape, skyColour, 2000, 0.3, 0, 16); // initial circles for the sky
  initializeCircles(waterCircles, waterShape, waterColour, 2000, 0.3, -0.15, 14); // initial circles for the water
  initializeCircles(greenCircles, greenShape, greenColour, 2000, 0.15, -0.25, 12); // initial circles for the green bushes
  initializeCircles(boardwalkCircles, boardwalkShape, boardwalkColour, 7000, -0.3, -0.4, 10); // initial circles for the boardwalk
}
function draw() {
  background(0); // clear the canvas with a black background
  frameCounter++; // frame counter increment to increase the speed

  // render the image on both the left and right halves
  for (let i = 0; i < 2; i++) {
      push(); // save the current transformation state
      translate(i * width / 2, 0); // shifts to the left or right half of the canvas

      if (i === 0) {
          // draws circles for the left half of the image (normal)
          animateCircles(skyCircles, skyShape, skyColour); // animate sky circles
          animateCircles(waterCircles, waterShape, waterColour); // animate water circles
          animateCircles(greenCircles, greenShape, greenColour); // animate green circles
          animateCircles(boardwalkCircles, boardwalkShape, boardwalkColour); // animate boardwalk circles
          drawScreamer(); // draw the main screamer figure
      } else {
          // right half (flipped images)
          scale(-1, 1); // flip the objects horizontally
          translate(-width / 2, 0); // move the origin back into the canvas

          animateCircles(skyCircles, skyFlippedShape, skyColour); // animate flipped sky circles
          animateCircles(waterCircles, waterFlippedShape, waterColour); // animate flipped water circles
          animateCircles(greenCircles, greenFlippedShape, greenColour); // animate flipped green circles
          animateCircles(boardwalkCircles, boardwalkFlippedShape, boardwalkColour); // animate flipped boardwalk circles
          drawScreamer(); // draw the flipped screamer figure
      }

      pop(); // restore transformation state
  }
}

// defined a function to build and animate circles with specific properties and add them to an array
function initializeCircles(circles, shape, colour, count, xSpeed, ySpeed, size) {
  for (let i = 0; i < count; i++) {
      let { x: xPos, y: yPos } = findRandomColourPosition(shape, colour, false); // finds xy coordinate within the shape with that colour
      let initialColour = getCachedColour(screamImg, int(xPos), int(yPos)); // retrieves original colour from screamImg

      circles.push({ // adds the circle to the array
          x: xPos, // initial x position
          y: yPos, // initial y position
          size: size + random(5), // randomizes the size
          opacity: 0, // initial opacity for a fade-in effect
          fadeIn: true, // enables fade-in effect
          delay: int(random(30, 150)), // random delay before starting animation
          opacityDecayRate: random(1, 3), // decay rate for fading out
          currentColour: initialColour, // set initial colour
          targetColour: initialColour, // initial target colour
          xSpeed: xSpeed, // x-axis speed
          ySpeed: ySpeed // y-axis speed
      });
  }
}
function animateCircles(circles, shape, shapeColour) {
  let buffer = 16; // allow circles to move slightly beyond the screen edges before resetting
  let pulse = sin(frameCount * 0.05) * 5; // create a pulse effect for circle size

  for (let i = 0; i < circles.length; i++) {
      let circle = circles[i];

      // start moving and fading in after delay
      if (frameCounter >= circle.delay) {
          circle.x += circle.xSpeed; // update x position
          circle.y += circle.ySpeed; // update y position

          // update color every 120 frames
          if (frameCounter % 120 === 0) {
              let newColor = color(random(255), random(255), random(255)); // generate a new random color
              circle.targetColour = newColor; // set the new target color
          }

          // interpolate between current and target colour
          circle.currentColour = lerpColor(circle.currentColour, circle.targetColour, 0.05); // smooth color transition

          let sizeWithPulse = circle.size + pulse; // apply pulse effect to circle size
          fill(red(circle.currentColour), green(circle.currentColour), blue(circle.currentColour), circle.opacity); // set fill color with opacity
          noStroke(); // disable stroke
          ellipse(circle.x, circle.y, sizeWithPulse, sizeWithPulse); // draw the circle

          // handle fade-in and fade-out behavior
          if (circle.fadeIn) {
              circle.opacity += 5; // increase opacity for fade-in
              if (circle.opacity >= 255) circle.fadeIn = false; // switch to fade-out when fully opaque
          } else {
              circle.opacity -= 2; // decrease opacity for fade-out
              if (circle.opacity <= 0) {
                  // reset circle when fully faded out
                  let newPosition = findRandomColourPosition(shape, shapeColour); // find new position for the circle
                  circle.x = newPosition.x; // reset x position
                  circle.y = newPosition.y; // reset y position
                  circle.opacity = 0; // reset opacity
                  circle.fadeIn = true; // start fading in again
                  circle.delay = frameCounter + int(random(30, 300)); // set new delay before the circle reappears
              }
          }
      }

      // check if the circle moves off the screen with a buffer zone
      if (circle.x < -buffer || circle.x > width + buffer || circle.y < -buffer || circle.y > height + buffer) {
          let newPosition = findRandomColourPosition(shape, shapeColour); // find new position for the circle
          circle.x = newPosition.x; // reset x position
          circle.y = newPosition.y; // reset y position
          circle.opacity = 0; // reset opacity
          circle.fadeIn = true; // start fading in again
          circle.delay = frameCounter + int(random(30, 300)); // set new delay before the circle reappears
      }
  }
}
// function to find a random position within a given shape
// ensures that the pixel colour matches the specified colour
function findRandomColourPosition(shape, colour, isFlipped = false) {
  let x, y; // declare variables for x and y coordinates
  let attempts = 0; // initialize attempts counter
  const maxAttempts = 1000; // set a limit for maximum attempts to find a match

  // repeat until the pixel matches the specified colour or max attempts are reached
  do {
      x = int(random(isFlipped ? width / 2 : 0, isFlipped ? width : width / 2)); // choose a random x position, considering flipped state
      y = int(random(height)); // choose a random y position
      attempts++; // increment attempts counter

      // check if the maximum number of attempts is reached
      if (attempts >= maxAttempts) {
          console.error("max attempts reached: unable to find matching colour"); // log an error if limit is reached
          break; // exit the loop
      }
  } while (!isShapeColour(getCachedColour(shape, x, y), colour)); // check if the pixel at (x, y) matches the shape's colour
  return { x, y }; // return the coordinates as an object
}

// function to check if the pixel colour matches the target shape colour
function isShapeColour(pixelColour, shapeColour) {
  return red(pixelColour) === red(shapeColour) &&
         green(pixelColour) === green(shapeColour) &&
         blue(pixelColour) === blue(shapeColour); // compare RGB values to check for a match
}

// retrieves the colour from image pixels at the specified coordinates
function getCachedColour(image, x, y) {
  let index = (x + y * image.width) * 4; // calculate the pixel index in the pixel array
  return color(image.pixels[index], image.pixels[index + 1], image.pixels[index + 2]); // return the colour at the given index
}

// function to draw the screamer figure on the canvas
function drawScreamer() {
  noStroke(); // ensure no outlines are drawn around shapes

  // the scale factor is created based on the window's height to maintain proportions
  let scaleFactor = height / 830; // adjust the scale based on the canvas height
  let verticalOffset = 80 * scaleFactor; // vertical offset for positioning elements

  // draw the main shape of the body with curves
  fill(76, 63, 55); // body colour
  beginShape();
  curveVertex(202 * scaleFactor, height); // start from bottom left
  curveVertex(202 * scaleFactor, 752 * scaleFactor); // curve towards the base of the body
  curveVertex(206 * scaleFactor, 692 * scaleFactor); // define waist shape
  curveVertex(188 * scaleFactor, 651 * scaleFactor); // inward curve for contour
  curveVertex(209 * scaleFactor, 593 * scaleFactor); // shoulder area
  curveVertex(222 * scaleFactor, 533 * scaleFactor); // upper body shape
  curveVertex(271 * scaleFactor, 509 * scaleFactor); // start of neck and head
  curveVertex(249 * scaleFactor, 434 * scaleFactor); // neck curve
  curveVertex(300 * scaleFactor, 387 * scaleFactor); // head shape
  curveVertex(365 * scaleFactor, 427 * scaleFactor); // complete head contour
  curveVertex(345 * scaleFactor, 520 * scaleFactor); // curve back down to body
  curveVertex(374 * scaleFactor, 610 * scaleFactor); // lower body
  curveVertex(305 * scaleFactor, 738 * scaleFactor); // return to lower section
  curveVertex(305 * scaleFactor, height); // close shape at the bottom right
  endShape(CLOSE);

  // draw the hand on the body
  fill(211, 164, 103); // hand colour
  beginShape();
  curveVertex(246 * scaleFactor, 567 * scaleFactor); // start point of the hand
  curveVertex(271 * scaleFactor, 509 * scaleFactor); // lower section of the hand
  curveVertex(249 * scaleFactor, 434 * scaleFactor); // hand curve
  curveVertex(300 * scaleFactor, 387 * scaleFactor); // wrist area
  curveVertex(365 * scaleFactor, 427 * scaleFactor); // base of the fingers
  curveVertex(345 * scaleFactor, 520 * scaleFactor); // top of the fingers
  curveVertex(374 * scaleFactor, 610 * scaleFactor); // back down along the hand
  curveVertex(353 * scaleFactor, 617 * scaleFactor); // finalize hand shape
  curveVertex(318 * scaleFactor, 542 * scaleFactor); // thumb area
  curveVertex(340 * scaleFactor, 450 * scaleFactor); // fingers outline
  curveVertex(285 * scaleFactor, 457 * scaleFactor); // top hand contour
  curveVertex(296 * scaleFactor, 505 * scaleFactor); // lower back of the hand
  curveVertex(263 * scaleFactor, 587 * scaleFactor); // end near the wrist
  endShape(CLOSE);

  // draw the face and its features
  fill(163, 144, 105); // face colour
  beginShape();
  curveVertex(295 * scaleFactor, 514 * scaleFactor); // start face outline
  curveVertex(284 * scaleFactor, 484 * scaleFactor); // upper face contour
  curveVertex(263 * scaleFactor, 447 * scaleFactor); // left side of the face
  curveVertex(293 * scaleFactor, 389 * scaleFactor); // chin area
  curveVertex(351 * scaleFactor, 422 * scaleFactor); // right side of the face
  curveVertex(342 * scaleFactor, 469 * scaleFactor); // upper right contour
  curveVertex(329 * scaleFactor, 492 * scaleFactor); // finish face contour
  curveVertex(313 * scaleFactor, 513 * scaleFactor); // chin
  endShape(CLOSE);

  // draw the eyes and mouth for expression
  fill(216, 181, 117); // colour for details
  ellipse(290 * scaleFactor, 440 * scaleFactor, 20 * scaleFactor, 30 * scaleFactor); // left eye
  ellipse(325 * scaleFactor, 440 * scaleFactor, 20 * scaleFactor, 30 * scaleFactor); // right eye
  ellipse(308 * scaleFactor, 490 * scaleFactor, 15 * scaleFactor, 30 * scaleFactor); // mouth
}
// function to resize the canvas to fit the current window size
function resizeCanvasToFitWindow() {
  let newWidth = windowWidth; // use the width of the window
  let newHeight = windowHeight; // use the height of the window

  resizeCanvas(newWidth, newHeight); // resize the canvas to new dimensions

  // calculate the width for each half of the screen
  let halfWidth = newWidth / 2;

  // resize all images to fill half the screen while maintaining aspect ratio
  screamImg.resize(halfWidth, newHeight); // resize 'The Scream' image
  skyShape.resize(halfWidth, newHeight); // resize the sky shape
  waterShape.resize(halfWidth, newHeight); // resize the water shape
  greenShape.resize(halfWidth, newHeight); // resize the green bush shape
  boardwalkShape.resize(halfWidth, newHeight); // resize the boardwalk shape

  // resize the flipped images to match the other half of the screen
  skyFlippedShape.resize(halfWidth, newHeight); // resize flipped sky shape
  waterFlippedShape.resize(halfWidth, newHeight); // resize flipped water shape
  greenFlippedShape.resize(halfWidth, newHeight); // resize flipped green bush shape
  boardwalkFlippedShape.resize(halfWidth, newHeight); // resize flipped boardwalk shape
}