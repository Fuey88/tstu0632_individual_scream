// INITIALISING VARIABLES
let screamImg; // hidden background image
let skyShape, waterShape, greenShape, boardwalkShape; // colour map overlays
let skyCircles = [], waterCircles = [], greenCircles = [], boardwalkCircles = []; // arrays to store circles for each shape
let imgAspectRatio; // aspect ratio for resizing
let skyColor, waterColor, greenColor, boardwalkColor; // define colours for each shape
let frameCounter = 0; // frame counter for interpolation frequency
let scaryMusic; // holds music file
let amplitude, fft; // amplitude (volume) and fft (frequency spectrum)
let isPlaying = false; // track if music is playing
let playText = "CLICK TO BEGIN MUSIC"; // text to display
let smoothedVolume = 0; // initialise smoothed volume level to prevent flickering
let smoothedSpeed = 1; // smoothing speed factor for circles
let smoothedMouthSize = 1; // smoothing scale factor for screaming mouth
let redIncrementValue = 0.2;  // increment amount for red value
let greenDecrementValue = 0.4; // decrement amount for green value
let blueDecrementValue = 0.2; // tecrement amount for blue value
let colorAdjustmentTimer = 0; // timer to control frequency of colour adjustments
let redIncrementTimer = 0; // timer tracking when to increment red value
let maxRedValue = 200; // max red value

// global variables for cumulative colour adjustments based on frequency
let cumulativeRed = 0;
let cumulativeGreen = 0;
let cumulativeBlue = 0;


function preload() {
  // loads images from assets folder
  screamImg = loadImage("assets/scream.png"); // loads into bg but doesn't display
  skyShape = loadImage("assets/skyColourMap.png"); // sky colour map
  waterShape = loadImage("assets/waterColourMap.png"); // water colour map
  greenShape = loadImage("assets/greenColourMap.png"); // foliage colour map
  boardwalkShape = loadImage("assets/boardwalkColourMap.png"); // boardwalk colour map

    
  scaryMusic = loadSound("assets/scaryMusic.mp3"); // scary music
}

function setup() {
  frameRate(30); // sets frame rate lower to reduce computational load
  imgAspectRatio = screamImg.width / screamImg.height; // calculates image aspect ratio
  resizeCanvasToFitWindow(); // initial resize based on window height
  screamImg.loadPixels(); // loads pixel data for scream image
  skyShape.loadPixels(); 
  waterShape.loadPixels();
  greenShape.loadPixels(); 
  boardwalkShape.loadPixels(); 

  // define target colours for circles to check shape pos
  skyColor = color(255, 116, 2); // sky colour
  waterColor = color(2, 2, 255); // water colour
  greenColor = color(30, 255, 0); // green colour
  boardwalkColor = color(153, 43, 0); // boardwalk colourx

  // initialise circles for each shape with speeds on x and y axis and customisable sizes
  initializeCircles(skyCircles, skyShape, skyColor, 5000, 0.1, 0, 14); // sky circles
  initializeCircles(waterCircles, waterShape, waterColor, 4000, 0.1, -0.02, 13); // water circles
  initializeCircles(greenCircles, greenShape, greenColor, 3000, 0.1, -0.08, 12); // green circles
  initializeCircles(boardwalkCircles, boardwalkShape, boardwalkColor, 7000, -0.1, -0.1, 11); // boardwalk circles

  // Set up text display for instructions
  textAlign(CENTER, CENTER);
  textSize(24);

   // setup sound analysis
   amplitude = new p5.Amplitude(); // volume
   fft = new p5.FFT(); // frequency
}

function draw() {
  background(0); // black background for contrast

  // display text if the music is not playing
  if (!isPlaying) {
    fill(255); // white colour for text
    text(playText, width / 2, 50); // Position text at the top center
  }


  // increase red colour every second if music is playing
  // Inside draw, replace existing red increment logic with the following
  if (isPlaying) {
    colorAdjustmentTimer += deltaTime;
  
    if (colorAdjustmentTimer >= 500) { // Adjusts every 500ms
      let lowFreq = fft.getEnergy("bass");
  
      // Increment or decrement based on frequency energy
      if (lowFreq > 150) {
        cumulativeRed = min(cumulativeRed + redIncrementValue, 255);
        cumulativeGreen = max(cumulativeGreen - greenDecrementValue, -255);
        cumulativeBlue = max(cumulativeBlue - blueDecrementValue, -255);
      }
  
      colorAdjustmentTimer = 0; // Reset timer
    }
  }


  frameCounter++; // increment frame counter - used for changing colours

  // music analysis 
  let volume = amplitude.getLevel(); // continuously gets the overall volume level
  smoothedVolume = lerp(smoothedVolume, volume, 0.1); // smooth volume level
  let spectrum = fft.analyze(); // gets an array of amplitude values across frequency spectrum
  let lowFreq = fft.getEnergy("bass"); // Analyze low frequencies
  let highFreq = fft.getEnergy("treble"); // and high frequencies
  smoothedSpeed = lerp(smoothedSpeed, map(lowFreq, 0, 255, 2, 6), 0.1); // smooth circle speed change based on freq
  smoothedMouthSize = lerp(smoothedMouthSize, map(highFreq, 0, 255, 1, 4), 0.1); //smooth mouth size change based on freq


  // move and draw circles for each shape
  moveAndDrawCircles(skyCircles, skyShape, skyColor, volume, spectrum);
  moveAndDrawCircles(waterCircles, waterShape, waterColor, volume, spectrum);
  moveAndDrawCircles(greenCircles, greenShape, greenColor, volume, spectrum);
  moveAndDrawCircles(boardwalkCircles, boardwalkShape, boardwalkColor, volume, spectrum);

  // draw the screamer
  drawScreamer();
}

// initialises circles with customisable size and speed
function initializeCircles(circles, shape, color, count, xSpeed, ySpeed, size) {
  for (let i = 0; i < count; i++) {
    let { x: xPos, y: yPos } = findRandomColorPosition(shape, color); // find random position in shape
    let initialColor = getCachedColor(screamImg, int(xPos), int(yPos)) || color(0); // fallback to black if undefined

    circles.push({
      x: xPos,
      y: yPos,
      size: size + random(5),
      opacity: 0,
      fadeIn: true,
      delay: int(random(30, 300)),
      opacityDecayRate: random(1, 1.8),
      baseColor: initialColor,     // original pixel colour
      currentColor: initialColor,  // set initial colour as current colour
      targetColor: initialColor,   // set initial colour as target colour
      redValue: 0,
      greenValue: 0,
      blueValue: 0,
      xSpeed: xSpeed,
      ySpeed: ySpeed
    });
  }
}

// moves, fades, and draws circles based on shape
// moves, fades, and draws circles based on shape
function moveAndDrawCircles(circles, shape, shapeColor, volume, spectrum) {
  let buffer = 14; // allow circles to move slightly beyond the screen edges before resetting

  // volume controls opacity
  let volumeMultiplier = map(smoothedVolume, 0, 0.2, 0, 1); // maps volume to opacity multiplier between 0 and 1 (higher = brighter)

  for (let i = 0; i < circles.length; i++) {
    let circle = circles[i];

    // start moving and fading in after delay
    if (frameCounter >= circle.delay) {
      circle.x += circle.xSpeed * smoothedSpeed; // apply smoothed speed to x position
      circle.y += circle.ySpeed * smoothedSpeed; // and y pos

      // Continuously update the circle’s target color based on the image beneath
      circle.targetColor = getCachedColor(screamImg, int(circle.x), int(circle.y));

      // Interpolate between current and target color for smooth color transition
      circle.currentColor = lerpColor(circle.currentColor, circle.targetColor, 0.1);

      // handle fade in and fade out
      if (circle.fadeIn) {
        circle.opacity += 20; // controls speed of opacity change for circles fading in
        if (circle.opacity >= 255) {
          circle.opacity = 255;
          circle.fadeIn = false; // switch to fading out
        }
      } else {
        circle.opacity -= circle.opacityDecayRate; // fade out more slowly
        if (circle.opacity <= 0) {
          // reset circle when fully faded out
          let newPosition = findRandomColorPosition(shape, shapeColor);
          circle.x = newPosition.x; // reset x position
          circle.y = newPosition.y; // reset y position
          circle.opacity = 0; // reset opacity
          circle.fadeIn = true; // start fading in again
          circle.delay = frameCounter + int(random(30, 300)); // set new delay with greater randomness

          // Reset colors after repositioning
          circle.currentColor = getCachedColor(screamImg, int(circle.x), int(circle.y));
          circle.targetColor = circle.currentColor;
        }
      }

      // Adjust circle opacity by applying volume multiplier
      let finalOpacity = circle.opacity * volumeMultiplier;
      finalOpacity = constrain(finalOpacity, 0, 255); // Ensure opacity is within valid range for RGB

      // Apply scale factor to circle size
      let scaleFactor = height / 812;
      
      // Use baseColor with added values for fill
      fill(
        constrain(red(circle.currentColor) + cumulativeRed, 0, 255),
        constrain(green(circle.currentColor) + cumulativeGreen, 0, 255),
        constrain(blue(circle.currentColor) + cumulativeBlue, 0, 255),
        finalOpacity
      );
      noStroke();
      ellipse(circle.x, circle.y, circle.size * scaleFactor, circle.size * scaleFactor);
    }

    // reset if circle moves off screen with buffer
    if (circle.x < -buffer || circle.x > width + buffer || circle.y < -buffer || circle.y > height + buffer) {
      let newPosition = findRandomColorPosition(shape, shapeColor);
      circle.x = newPosition.x; // reset x position
      circle.y = newPosition.y; // reset y position
      circle.opacity = 0; // reset opacity
      circle.fadeIn = true; // start fading in again
      circle.delay = frameCounter + int(random(30, 300)); // set new delay with greater randomness
    }
  }
}


// gets colour from cached pixel data
function getCachedColor(image, x, y) {
  let index = (x + y * image.width) * 4; // calculate index in pixels array
  return color(image.pixels[index], image.pixels[index + 1], image.pixels[index + 2]); // return colour
}

// finds a random position within the specified colour area
function findRandomColorPosition(shape, color) {
  let x, y;
  let attempts = 0;
  const maxAttempts = 1000;

  do {
    x = int(random(width)); // random x within canvas
    y = int(random(height)); // random y within canvas
    attempts++;
    if (attempts >= maxAttempts) {
      console.error("max attempts reached. unable to find matching colour");
      break;
    }
  } while (!isShapeColor(getCachedColor(shape, x, y), color));
  return { x, y }; // return position
}

// checks if a pixel colour matches the specified shape colour
function isShapeColor(pixelColor, shapeColor) {
  return red(pixelColor) === red(shapeColor) &&
         green(pixelColor) === green(shapeColor) &&
         blue(pixelColor) === blue(shapeColor);
}

// resizes canvas based on window height while maintaining aspect ratio
function resizeCanvasToFitWindow() {
  let newHeight = windowHeight; // new height based on window
  let newWidth = newHeight * imgAspectRatio; // calculate new width

  resizeCanvas(newWidth, newHeight); // resize canvas
  screamImg.resize(newWidth, newHeight); // resize image
  skyShape.resize(newWidth, newHeight); 
  waterShape.resize(newWidth, newHeight); 
  greenShape.resize(newWidth, newHeight); 
  boardwalkShape.resize(newWidth, newHeight);
  screamImg.loadPixels(); // reload pixels
  skyShape.loadPixels();
  waterShape.loadPixels(); 
  greenShape.loadPixels(); 
  boardwalkShape.loadPixels(); 
}

function windowResized() {
  resizeCanvasToFitWindow(); // adjust canvas on window resize
}

function drawScreamer() {
  noStroke(); // ensures no outlines are drawn around shapes

  // the screamer was originally made without accounting for window resize,
  // the scale factor was created based on the windows height in comparison
  // to the height of the original proportions of the screamer at the optimal height
  // with scaleFactor being added to each element ensuring correct sizing for current window height
  let scaleFactor = height / 812;

  // Draw bodies main shape with curves
  fill(
    constrain(76 + cumulativeRed, 0, 255),
    constrain(63 + cumulativeGreen, 0, 255),
    constrain(55 + cumulativeBlue, 0, 255)
  );
  beginShape();
  curveVertex(width / 3, height); // start from bottom left of the screen
  curveVertex(202 * scaleFactor, 752 * scaleFactor); // curve down towards body base
  curveVertex(206 * scaleFactor, 692 * scaleFactor); // upward curve to define waist
  curveVertex(188 * scaleFactor, 651 * scaleFactor); // curve inwards for shape contour
  curveVertex(209 * scaleFactor, 593 * scaleFactor); // define shoulder area
  curveVertex(222 * scaleFactor, 533 * scaleFactor); // further shape upper body
  curveVertex(271 * scaleFactor, 509 * scaleFactor); // neck and head start
  curveVertex(249 * scaleFactor, 434 * scaleFactor); // further curve for neck
  curveVertex(300 * scaleFactor, 387 * scaleFactor); // head curve start
  curveVertex(365 * scaleFactor, 427 * scaleFactor); // complete head shape
  curveVertex(345 * scaleFactor, 520 * scaleFactor); // outline back to body
  curveVertex(374 * scaleFactor, 610 * scaleFactor); // lower body
  curveVertex(305 * scaleFactor, 738 * scaleFactor); // return to lower body area
  curveVertex(320 * scaleFactor, height); // complete body outline at bottom right
  endShape(CLOSE);

  // draw his hands - positioned near upper part of the body
  fill(
    constrain(175 + cumulativeRed, 0, 255),
    constrain(155 + cumulativeGreen, 0, 255),
    constrain(105 + cumulativeBlue, 0, 255)
  );
  beginShape();
  curveVertex(246 * scaleFactor, 567 * scaleFactor); // hand start
  curveVertex(271 * scaleFactor, 509 * scaleFactor); // move to lower hand section
  curveVertex(249 * scaleFactor, 434 * scaleFactor); // curve up to hand contour
  curveVertex(300 * scaleFactor, 387 * scaleFactor); // hand wrist area
  curveVertex(365 * scaleFactor, 427 * scaleFactor); // base of fingers
  curveVertex(345 * scaleFactor, 520 * scaleFactor); // up along fingers
  curveVertex(374 * scaleFactor, 610 * scaleFactor); // back down along hand
  curveVertex(353 * scaleFactor, 617 * scaleFactor); // close off hand shape
  curveVertex(318 * scaleFactor, 542 * scaleFactor); // hand thumb area
  curveVertex(340 * scaleFactor, 450 * scaleFactor); // fingers continue
  curveVertex(285 * scaleFactor, 457 * scaleFactor); // top of hand contour
  curveVertex(296 * scaleFactor, 505 * scaleFactor); // lower back of hand
  curveVertex(263 * scaleFactor, 587 * scaleFactor); // base of hand near wrist
  endShape(CLOSE);

  // draw face: contour of the face structure
  fill(
    constrain(163 + cumulativeRed, 0, 255),
    constrain(144 + cumulativeGreen, 0, 255),
    constrain(105 + cumulativeBlue, 0, 255)
  );
  beginShape();
  curveVertex(295 * scaleFactor, 514 * scaleFactor); // face outline start
  curveVertex(284 * scaleFactor, 484 * scaleFactor); // top of face
  curveVertex(263 * scaleFactor, 447 * scaleFactor); // curve down left side of face
  curveVertex(293 * scaleFactor, 389 * scaleFactor); // lower chin area
  curveVertex(351 * scaleFactor, 422 * scaleFactor); // right side of face
  curveVertex(342 * scaleFactor, 469 * scaleFactor); // return to top right of face
  curveVertex(329 * scaleFactor, 492 * scaleFactor); // finish contour
  curveVertex(313 * scaleFactor, 513 * scaleFactor); // end at chin
  endShape(CLOSE);

  //  eyes and mouth to define facial expression
  fill(
    constrain(206 + cumulativeRed, 0, 255),
    constrain(182 + cumulativeGreen, 0, 255),
    constrain(122 + cumulativeBlue, 0, 255)
  );
  ellipse(290 * scaleFactor, 440 * scaleFactor, 10 * scaleFactor * smoothedMouthSize, 8 * scaleFactor * smoothedMouthSize); // left eye
  ellipse(325 * scaleFactor, 440 * scaleFactor, 10 * scaleFactor * smoothedMouthSize, 8 * scaleFactor * smoothedMouthSize); // right eye
  stroke(70, 56, 45);
  strokeWeight(2);
  ellipse(308 * scaleFactor, 490 * scaleFactor, 13 * scaleFactor * smoothedMouthSize, 20 * scaleFactor * smoothedMouthSize); // mouth with expansion capability
}
 
// function to play music when the user clicks and only if music is not already playing
function mousePressed() {
  if (!isPlaying) {
    scaryMusic.play();
    scaryMusic.onended(() => {
      isPlaying = false;
      playText = "CLICK TO PLAY MUSIC"; // show text when music ends
      resetColorAdjustments(); // Reset colours when the music ends
    });
    isPlaying = true;
    playText = ""; // remove text when music starts
  }
}

// helper function to reset colours after song finishes
function resetColorAdjustments() {
  cumulativeRed = 0;
  cumulativeGreen = 0;
  cumulativeBlue = 0;
}