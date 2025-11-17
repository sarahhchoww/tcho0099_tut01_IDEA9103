// =======================================================================
// ======================== Global Variables =============================
// =======================================================================
// This section defines all shared state used across the sketch, including
// the global background colour, colour palettes for circles and patterns,
// and the arrays that store Circle objects and the subset of circles used
// as connection nodes. These variables are initialised in setup() and then
// read by the drawing functions in draw(), layout, and the Circle class.

let globalBgColor;       // Background colour
let circleBasePalette;   // Base colours for the circles (Deep Earth tones)
let patternPalette;          // Colours for patterns/details (High contrast/Bright)
let circles = [];
let connectedNodes = [];        // Stores all circle objects, although this step is not neccessary, 
// it is useful for individual assignments as we may operate on individual circles.
 // Stores the circles selected as connection nodes (key "VIP" nodes)

//Pulsing circles
let noiseValues=[];//
let noiseStep=0.01; //Increment size
let noiseOffsets =[]; //
let globalNoiseOffset =0;

//Background
let backgroundDots=[];
let bgDotNoiseOffset=0;
let bgDotNoiseStep=0.003;

//Smooth color transition
let colorNoiseValues = [];
let colorNoiseOffsets = [];


// =========================================================================
// ======================= Layout & Background =============================
// =========================================================================
// This section is responsible for the overall composition of the artwork.
// It generates the fixed layout of circle centres, selects some of them as
// "VIP" nodes for the network layer, draws the distance-based connection
// lines between those nodes, and renders the random dot background texture
// that sits underneath all circles.

// --- Responsiveness ---
function windowResized() { // Sketch resizes according to window size
    let size = min(windowWidth, windowHeight);
    resizeCanvas(size, size);

    initializeBackgroundDots();
    createFixedLayout();
    
}
// --- Layout generation ---
function createFixedLayout() {
    circles = [];  //initialise
    connectedNodes = []; 
    noiseValues = [];
    noiseOffsets = [];
    colorNoiseValues = [];
    colorNoiseOffsets = [];
  
    // Base radius unit relative to canvas width
    let r = width / 8; 

    // Add circles along specific diagonal coordinates
    // Parameters: count, startX, startY, stepX, stepY, radius
    // Each line has 3 circles, different starting points
    addCirclesOnLine(3, width / 7.1, height / 7.1, width / 4.8, height / 4.8, r);
    addCirclesOnLine(3, width / 2, (height * 2) / 20, width / 4.8, height / 4.8, r);
    addCirclesOnLine(3, (width * 4) / 5, 0, width / 4.8, height / 4.8, r);
    addCirclesOnLine(3, width / 20, height / 2.2, width / 4.8, height / 4.8, r);
    addCirclesOnLine(3, 0, (height * 8) / 10, width / 4.8, height / 4.8, r);
}

function addCirclesOnLine(count, startX, startY, stepX, stepY, r) {
    for (let i = 0; i < count; i++) {
        let x = startX + stepX * i;
        let y = startY + stepY * i;
        let c = new Circle(x, y, r);
        circles.push(c);

        noiseOffsets.push(circles.length * 2.5);
        noiseValues.push(1.0); // Ensure pulse is different for each circle

        colorNoiseOffsets.push(circles.length * 3.7);  
        colorNoiseValues.push(0); // Ensure color animation is different
    
      if (random(1) < 0.8) { // 80% chance that circle has a connecting node
      connectedNodes.push(c);
    }
  }
}

// --- Draw connecting lines ---
function drawNetworkLines() { // connectors
    let linkColor = color(240, 230, 200, 180); // Creamy color, semi-transparent

    // Use push/pop to isolate style settings for lines
    push(); 
    stroke(linkColor);
    strokeWeight(10); // Fixed wide width
    // strokeCap(ROUND) sets rounded line endings for smoother, organic-looking connectors.
    // From the p5.js reference: https://p5js.org/reference/p5/strokeCap/
    strokeCap(ROUND); // Rounded ends for natural look

    for (let i = 0; i < connectedNodes.length; i++) {
        for (let j = i + 1; j < connectedNodes.length; j++) { // Avoids checking the same pair
            let c1 = connectedNodes[i];
            let c2 = connectedNodes[j];
            // Compute Euclidean distance between two circle centers.
            // dist() is from the p5.js reference: https://p5js.org/reference/p5/dist/
            let d = dist(c1.x, c1.y, c2.x, c2.y); // Calculate distance between two nodes
            // Only connect nodes that are within a certain distance, so that circles next to each other are connected
            if (d < width / 2.8) { // Will not draw a line across the canvas
                line(c1.x, c1.y, c2.x, c2.y); 
            }
        }   
    }
    pop();
}

// --- Background texture: dense random scattered white dots ---
/*
    This background texture uses probabilistic dot density to distribute thousands of 
    semi-transparent white dots across the canvas. 
*/

function initializeBackgroundDots() {
    backgroundDots=[];
    let density=0.004; // So that background would not be too dense
    let numDots=floor(width*height*density); // Num. of dots changes with window size

    for (let i = 0; i < numDots; i++) { // for loop generates the dots
    let dot = {
      baseX: random(width), // Randomised x and y-coordinates based on window width & height
      baseY: random(height),
      noiseOffsetX: random(1000),
      noiseOffsetY: random(1000, 2000), // Smooth animation, noise for x and y will fall in diff range
      size: random(1.5, 4), // Different sizes for the dots
      alpha: random(100, 200) // Different opacity for the dots -> creates DEPTH
    };
    backgroundDots.push(dot);
  }
}

function updateAndDrawBackgroundDots() {
  push();
  noStroke(); // To model stars
  for (let i = 0; i < backgroundDots.length; i++) { // for loop gives dots new position
    let dot = backgroundDots[i];
    
    let noiseX = noise(dot.noiseOffsetX + bgDotNoiseOffset); // Incorporate time in noise to get smooth animation
    let noiseY = noise(dot.noiseOffsetY + bgDotNoiseOffset);
    
    let displaceX = map(noiseX, 0, 1, -30, 30); // Convert noise to displacement to map the dots
    let displaceY = map(noiseY, 0, 1, -30, 30);
    
    let currentX = dot.baseX + displaceX;
    let currentY = dot.baseY + displaceY;
    
    if (currentX < 0) currentX += width; // Ensure dots will not keep floating off the window
    if (currentX > width) currentX -= width;
    if (currentY < 0) currentY += height;
    if (currentY > height) currentY -= height;
    
    fill(255, 255, 255, dot.alpha);
    ellipse(currentX, currentY, dot.size);
  }
  pop();
}

function updateNoiseValues() {
  for (let i = 0; i < circles.length; i++) {
    // Size noise
    let noiseVal = noise(noiseOffsets[i] + globalNoiseOffset);
    noiseValues[i] = map(noiseVal, 0, 1, 0.8, 1.2);
    
    // Color noise (slower)
    let colorNoise = noise(colorNoiseOffsets[i] + globalNoiseOffset * 0.3);
    colorNoiseValues[i] = colorNoise;
  }
}

// ======================================================================
// ======================== CIRCLE CLASS ================================
// ======================================================================
// The Circle class encapsulates all logic for drawing a single circular
// motif. Each Circle instance stores its position, radius, and randomly
// chosen pattern types for the outer, middle, and inner layers. The class
// provides a display() method that renders the circle as a three-layer
// structure (buffer, outer, middle, inner) using a variety of generative
// pattern functions.

class Circle {
/*
    Each Circle object randomly selects pattern types for its outer, middle,
    and inner layers. This modular structure expands on OOP techniques,
    enabling controlled variation through generative rules.
*/
    constructor(x, y, r) {
      this.isOrbiting = random(1) < 0.6;
      if (this.isOrbiting) {
        this.orbitCenterX = x; 
        this.orbitCenterY = y; // The centre
        this.orbitRadius = random(width * 0.03, width * 0.12); // Different orbiting circumferemce
        this.orbitAngle = random(TWO_PI); // Starts at a different angle, so they would not look robotic
        this.orbitSpeed = random(0.003, 0.015); // Different orbiting speeds

        this.x = this.orbitCenterX + cos(this.orbitAngle) * this.orbitRadius; 
        this.y = this.orbitCenterY + sin(this.orbitAngle) * this.orbitRadius; // Starting position stored as x and y
    } else {
        this.x = x;
        this.y = y;
    }
        this.baseR = r; // Original radius when circle has not started pulsing

        // Randomly assign pattern types
        this.outerPatternType = floor(random(4)); 
        this.middlePatternType = floor(random(4)); 
        this.innerPatternType = floor(random(2)); 

        this.irregularity = 0.02; 
    }
    updatePosition() {
      if (this.isOrbiting) {
        this.orbitAngle += this.orbitSpeed;
        this.x = this.orbitCenterX + cos(this.orbitAngle) * this.orbitRadius;
        this.y = this.orbitCenterY + sin(this.orbitAngle) * this.orbitRadius;
      }
    }

    // --- Main Display Method ---
    // Uses push/pop/translate to simplify drawing coordinates (relative to center 0,0)
    display(sizeMultiplier = 1.0, colorNoise = 0) { // Changed parameters for pulsing and animated colors
      this.r = this.baseR * sizeMultiplier; // // updated radius since circle has a larger radius when pulsing
      this.colorNoise = colorNoise;
  
        push(); 
        translate(this.x, this.y); 
  
        this.drawHandDrawnCircle(this.r * 1.05, globalBgColor, null, 0);
        this.displayOuterPattern();  
        this.displayMiddlePattern(); 
        this.displayInnerPattern();  
  
        pop();
}
// Perlin noise for patterns and colors
getBaseColorFromNoise() {
    let index = floor(this.colorNoise * circleBasePalette.length) % circleBasePalette.length; // Round to whole num after multiplying; % to prevent 5
    return circleBasePalette[index];
}

getPatternColorFromNoise() {
    let index = floor(this.colorNoise * patternPalette.length) % patternPalette.length;
    return patternPalette[index];
  }

    // --- Drawing Utilities (Helpers) ---
    /*
        Many of the custom shapes in this sketch use beginShape() together with
        curveVertex() to build smooth, organic outlines instead of perfect geometric primitives. 
        This technique was not fully covered in class and is adapted from the official p5.js reference:
            - beginShape(): https://p5js.org/reference/p5/beginShape/
            - curveVertex(): https://p5js.org/reference/p5/curveVertex/
        By adding small random jitter to the radii of points before calling
        curveVertex(), we simulate hand-drawn contours and irregular blobs.
    */

    drawIrregularBlob(rOffset, angle, size, col) {
    //beginShape() + curveVertex()： draw a small, irregular dot shape at a given radial offset and angle.
    // Calculate position based on polar coordinates
        let x = cos(angle) * rOffset;
        let y = sin(angle) * rOffset;

        fill(col);
        noStroke();
        
        push();
        translate(x, y); 
        rotate(random(TWO_PI)); // Random rotation for variety
        beginShape();
        let points = 8;  
        for (let i = 0; i < points; i++) {
            let a = TWO_PI / points * i;
            // Jitter the radius of the dot itself
            let r = size * 0.5 * random(0.85, 1.15); 
            curveVertex(cos(a) * r, sin(a) * r); 
        }
        endShape(CLOSE);
        pop();
    }

    // larger version of drawIrregularBlob() used to draw big circular motifs
    drawHandDrawnCircle(r, fillCol, strokeCol, strokeW) {
    // draws a large base circle with a slightly jittered radius, 
    // beginShape() + curveVertex(): described above to create an organic, hand-drawn outline.

    //This function can be used to draw circles both with fill and without fill. 
        if (fillCol) fill(fillCol); else noFill();
        if (strokeCol) stroke(strokeCol); else noStroke();
        if (strokeW) strokeWeight(strokeW);

        beginShape();
        let points = 50;  // if the number of points is too small, the circle will look like a polygon.
        // if the number of points is too big, the circle will look like too perfect!
        for (let i = 0; i <= points; i++) {
            let angle = (TWO_PI / points) * i;
            // Jitter the main radius
            let jitter = random(-r * 0.01, r * 0.01); 
            let radius = r + jitter;
            curveVertex(cos(angle) * radius, sin(angle) * radius);
        }
        endShape(CLOSE);
    }

    // ================= OUTER PATTERNS =================
    displayOuterPattern() {
        // we want random color to increase the diversity of the outer patterns
        let baseColor = this.getBaseColorFromNoise();
        this.drawHandDrawnCircle(this.r, baseColor, color(0, 50), 2);
        let patCol = this.getPatternColorFromNoise();

        // draw the outer pattern based on the pattern type
        switch (this.outerPatternType) {
            case 0: this.drawOuterDotsPattern(patCol); break;
            case 1: this.drawOuterRadiatingLinesPattern(patCol); break;
            case 2: this.drawOuterStripedRingPattern(patCol); break;
            case 3: this.drawOuterRadialDashPattern(patCol); break; 
        }
    }

    // Pattern 0: Irregular Dots Ring
    drawOuterDotsPattern(col) {
        let dotSize = this.r * 0.07;  
        let dotSpacing = this.r * 0.09; 
        // the dots ring starts from a radius of 0.65 times the radius of the circle
        // and will end at 0.95 times the radius of the circle
        // you can adjust all the parameters to achieve the effect you want
        for (let radius = this.r * 0.65; radius < this.r * 0.95; radius += dotSpacing) { 
            let count = floor((TWO_PI * radius) / dotSpacing); // calculate the number of dots in this radius
            //so the density of dots on each circle is identical
            for (let i = 0; i < count; i++) {  // draw dots ring
                let angle = (TWO_PI / count) * i;
                this.drawIrregularBlob(radius, angle, dotSize, col);
            }
        }
    }

    // Pattern 1: Radiating Lines (Sunburst)
    // Uses rotate() to simplify drawing lines radiating from center
    drawOuterRadiatingLinesPattern(col) {
        let numLines = 40;
        stroke(col);
        strokeWeight(this.r * 0.015);
        strokeCap(ROUND);
        
        for (let i = 0; i < numLines; i++) {
            let angle = (TWO_PI / numLines) * i + random(-0.05, 0.05); // add random jitter to each line
            
            push(); 
            rotate(angle); // Rotate context
            // Draw line along the X-axis
            line(this.r * 0.6, 0, this.r * 0.95, 0);
            // Draw dot at the tip
            this.drawIrregularBlob(this.r * 0.95, 0, this.r * 0.03, col); 
            pop(); 
        }
    }

    // Pattern 2: Striped Ring
    drawOuterStripedRingPattern(col) {
        noFill();
        stroke(col);
        let baseStrokeWeight = this.r * 0.025; 
        let numRings = 2;  // we only want 2 rings to make the pattern look more brief
        // You can increase the number to get a more dense ring pattern
        for (let i = 0; i < numRings; i++) {
            let radius = map(i, 0, numRings - 1, this.r * 0.65, this.r * 0.9);
            // The map() function scales a value from one range to another.
            // Here, it takes the loop counter 'i' (which goes from 0 to numRings - 1)
            // and converts it to a corresponding radius value within the desired range
            // (from this.r * 0.65 to this.r * 0.9).
            strokeWeight(baseStrokeWeight * random(0.8, 1.2)); 
            this.drawHandDrawnCircle(radius, null, col, null);
            // Because we don't want a circle with fill, we pass 'null' for fillCol.
        }
    }
    
    // Pattern 3: Radial Dash (Sine Wave Spring)
    // Uses sin() to create a continuous wavy circumference
    // This pattern also relies on beginShape() + curveVertex() to render the wavy outer contour as a continuous organic loop.
    drawOuterRadialDashPattern(col) {
        noFill(); 
        stroke(col); 
        strokeWeight(this.r * 0.025);
        let baseRadius = this.r * 0.73;
        let waveHeight = baseRadius * 0.30;
        // waveHeight is the amplitude: how far the wave goes "in" and "out" from the baseRadius.
        let waveFrequency = 60;
        // waveFrequency controls how many full oscillations (bounces) happen around the circle.
        let totalPoints = 240;   
        // totalPoints determines the smoothness (resolution) of the shape. More points = smoother.
        // we use sin to create a wavy effect, it looks like a spring 
        beginShape();
        for (let j = 0; j <= totalPoints; j++) {
            let angle = (TWO_PI / totalPoints) * j;
            let offset = sin(angle * waveFrequency) * waveHeight;
            let finalRadius = baseRadius + offset;
            finalRadius += random(-this.r * 0.005, this.r * 0.005);
            curveVertex(cos(angle) * finalRadius, sin(angle) * finalRadius);
        }
        endShape(CLOSE); 
    }

    // ================= MIDDLE PATTERNS =================
    displayMiddlePattern() {
        let midBgColor = this.getBaseColorFromNoise();
        this.drawHandDrawnCircle(this.r * 0.55, midBgColor, null, 0);
        let patCol = this.getPatternColorFromNoise();

        switch (this.middlePatternType) {
            case 0: this.drawMiddleConcentricDotsPattern(patCol); break;
            case 1: this.drawMiddleUshapePattern(patCol); break;
            case 2: this.drawMiddleSolidRings(patCol); break;
            case 3: this.drawMiddleConcentricRings(patCol); break; 
        }
    }

  // Pattern 0: Concentric Dots
  // small version of drawOuterConcentricDotsPattern
    drawMiddleConcentricDotsPattern(col) {
        let dotSize = this.r * 0.04;
        for (let r = this.r * 0.2; r < this.r * 0.5; r += dotSize * 1.5) {
            let count = floor((TWO_PI * r) / (dotSize * 1.5));
            for (let i = 0; i < count; i++) {
                let angle = (TWO_PI / count) * i;
                this.drawIrregularBlob(r, angle, dotSize, col);
            }
        }
    }

    // Pattern 1: U-Shape Symbols
    // Represents a person sitting in Indigenous art
    drawMiddleUshapePattern(col) {
        noFill();
        stroke(col);
        strokeWeight(this.r * 0.02);
        let count = 8; // The total number of U-shapes to draw.
        let r = this.r * 0.35; // The radius of the orbit (the circle) on which the U-shapes will be placed.
    
        for (let i = 0; i < count; i++) {
            let angle = (TWO_PI / count) * i;
            // Calculate the angle for this specific shape's position around the circle.
            // (e.g., 0, 45, 90, 135 degrees...)
            push();
            rotate(angle); 
            translate(r, 0); 
            rotate(PI/2); 
            // arc() draws a semicircle from angle 0 to PI (180 degrees), creating a U-shape. 
            // from the official p5.js reference: https://p5js.org/reference/p5/arc/
            // The size of the arc is relative to the main circle's radius.
            arc(0, 0, this.r*0.15, this.r*0.15, 0, PI); 
            pop();
        }
    }

    // Pattern 2: Solid Rings
    drawMiddleSolidRings(col) {
        this.drawHandDrawnCircle(this.r * 0.45, col, null, 0);
        let col2Index = floor((this.colorNoise + 0.3) * patternPalette.length) % patternPalette.length;
        let col2 = patternPalette[col2Index];
        this.drawHandDrawnCircle(this.r * 0.3, col2, null, 0);
    }

  // Pattern 3: Concentric Rings
    drawMiddleConcentricRings(col) {
        noFill();
        stroke(col);
        let baseStrokeWeight = this.r * 0.01; 
        let numRings = 5;  // The total number of concentric rings to draw.
        for (let j = 0; j < numRings; j++) {
            let currentRadius = map(j, 0, numRings - 1, this.r * 0.3, this.r * 0.5);
            strokeWeight(baseStrokeWeight * random(0.8, 1.2)); 
            beginShape();
            let points = 25; 
            for (let i = 0; i <= points; i++) {
                let angle = (TWO_PI / points) * i;
                let jitter = random(-this.r * 0.025, this.r * 0.025); 
                let radius = currentRadius + jitter;
                curveVertex(cos(angle) * radius, sin(angle) * radius);
            }
            endShape(CLOSE);
        }
    }

    // ================= INNER PATTERNS =================
    displayInnerPattern() {
        let innerBaseColor = this.getBaseColorFromNoise();
        this.drawHandDrawnCircle(this.r * 0.25, innerBaseColor, null, 0);
        let patCol = this.getPatternColorFromNoise();
        
        if (this.innerPatternType === 0) {
        // Simple large blob (Center Eye)
            this.drawIrregularBlob(0, 0, this.r * 0.15, patCol); // 0,0 is center
        } else {
        // Spiral Line
            noFill();
            stroke(patCol);
            strokeWeight(this.r * 0.015);
            // Here we again use beginShape() + curveVertex() to build a spiral-like
            // path, applying the same hand-drawn curve technique to the inner core.
            beginShape();
            for (let i = 0; i < 50; i++) {
                let r = map(i, 0, 50, 0, this.r * 0.2);
                let angle = i * 0.4;
                curveVertex(cos(angle)*r, sin(angle)*r);
            }
        endShape();
        }
    }
}

function setup() {
    // Use min dimension to ensure square aspect ratio fits screen
    let size = min(windowWidth, windowHeight);
    createCanvas(size, size);
  
    // pixelDensity() was not covered in class. 
    // It comes from the p5.js reference: https://p5js.org/reference/p5/pixelDensity/
    // It increases the device pixel ratio so the artwork renders more sharply on high-DPI/Retina screens.
    pixelDensity(2); 

    // --- 1. Colour palette system (Aboriginal-inspired style) ---
    globalBgColor = color(30, 20, 15); // Deep, dark earth background

    circleBasePalette = [
        color(90, 40, 20),   //  (Red Ochre)
        color(60, 30, 15),   //  (Deep Earth)
        color(40, 45, 35),   //  (Bush Green)
        color(110, 60, 30),  //  (Burnt Orange)
        color(20, 20, 20)    //  (Charcoal)
    ];

    patternPalette = [
        color(255, 255, 255), //  (Ceremony White)
        color(255, 240, 200), //  (Cream)
        color(255, 215, 0),   //  (Sun Yellow)
        color(255, 140, 80),  //  (Bright Ochre)
        color(160, 180, 140), //  (Sage)
        color(200, 200, 210)  //  (Ash)
    ];
    initializeBackgroundDots();

    createFixedLayout();
}

function updateCirclePositions() {
  for (let i = 0; i < circles.length; i++) {
    circles[i].updatePosition();
  }
}

function draw() {
    background(globalBgColor); 

    updateNoiseValues(); 
    updateCirclePositions();

    // 1. Background Texture
    // Draw random white dots that fill the canvas to create atmosphere
    updateAndDrawBackgroundDots();

    // 2. Layout Generation
    // Calculate positions for all circles based on a fixed geometric grid
    //createFixedLayout(); // move to setup()

    // 3. Connection Layer (Songlines)
    // Draw wide network lines between selected circle centres (VIP nodes)
    // Rendered BEFORE circles so lines appear to go *under* them
    drawNetworkLines();
    for (let i = 0; i < circles.length; i++) { // Calculates noise value 
    let sizeMultiplier = noiseValues[i];
    let colorIndex = colorNoiseValues[i];
    circles[i].display(sizeMultiplier, colorIndex);
  }

    // 4. Main Circle Layer
    // Iterate through all circle objects and call their display method
  
  globalNoiseOffset += noiseStep;
  bgDotNoiseOffset += bgDotNoiseStep;
    
    //noLoop(); // This row is removed since the current code is animated
}