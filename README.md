# Individual Project

The project is an animated, audio-visual piece inspired by Edvard Munch’s *The Scream*. My artwork was an attempt to remain faithful to what I believe to be the core theme of The Scream. I wanted to portray a moment of intense existential anguish in reaction to the feeling of isolation at being uncertain of one’s place in the vast world, with the surroundings seeming to reflect feelings of panic and amorphism. Below are the steps I took to differentiate my version from the group’s main artwork.

## Key Modifications

**Removed Mirroring**
- Removed the mirroring effect to enhance the feeling of isolation.

**Fixed Resizing Issues**
- Removed issues with resizing from the group project

**Integrated Audio**
   - Loaded an mp3 file and added variables to control volume and frequency.
   - Included a text prompt instructing the user to click if music is not playing, due to browser restrictions on autoplaying audio.
   - Created a `mousePressed` function to play the music when clicked, and used an `isPlaying` variable to track playback status.
   - Added an `onended` event listener to reset colour adjustments, re-enable the play prompt, and handle actions when the music stops.

**Real-Time Sound Analysis**
   - Used `p5.Amplitude` to capture the music’s volume level continuously.
   - Used `p5.FFT` (Fast Fourier Transform) to analyse frequency ranges, driving visual effects:
      - Low Frequencies: Control circle speed and colour saturation.
      - High Frequencies: Control the screamer’s mouth size, making it appear to “scream” in response to the music.

**Dynamic Colour Adjustments Based on Frequency**
   - Added cumulative colour variables that incrementally change based on bass frequency, creating a pulsing effect.
   - Adjusted colours every 500ms based on bass levels, increasing red while reducing green and blue.
   - Reset colour adjustments after the music stops for a visual reset on each replay.

**Opacity and Movement Linked to Volume**
   - Modified `moveAndDrawCircles` to adjust circle opacity based on volume levels for a responsive visual effect.
   - Added `smoothVolume` to prevent flickering from rapid volume changes, ensuring smooth opacity transitions.

**Detailed Drawing of Screamer Figure**
   - Improved the details of the Screamers face.

**Colour and Speed Adjustments for Circles**
   - Low frequencies increase circle speed and initiate colour changes, making circles progressively redder.
   - Used `lerp` for smooth transitions in speed (`smoothedSpeed`) and mouth size (`smoothedMouthSize`), preventing abrupt changes.


