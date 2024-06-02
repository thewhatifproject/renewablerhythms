// You're in the right place.
// Author: Daniele Giannini / Codex LLM GPT4o
// Don't forget to mentionthe author if you copy something!
// Icon design credit: heisenberg_jr from Flaticon


// Initialize empty array for particle objects and an empty object for storing daily production data
let particles = [];
let dailyData = {};

// Declare variables for use in setting up the visualization grid
let dates;
let cols, rows;

// Variables for storing production data and flow fields for different energy types
let productionData;
let flowfields = {};
let maxEnergyValueDay = 0;

// Canvas and control variables for rendering and interaction
let canvas;
let currentDateIndex = 0;
let lastUpdate = -1;
const updateInterval = 60; // Time interval for updating the visualization in milliseconds
let scl = 20; // Scale factor for the flow field grid
let inc = 0.1; // Increment for noise function, affects detail of flow field
let zoff = 0; // Z offset for noise function, used to animate the flow field
let lifeSpan = 255; // Lifespan of particles, determines how long they stay on screen

// Sound objects for different energy types
let soundBiomass;
let soundWind;
let soundGeothermal;
let soundHydro;
let soundPhotovoltaic;
let soundEnabled = false; // Flag to toggle sound on and off
let isCanvaFull = false; // Flag to toggle full screen mode

// Constants for particle size and speed
const minSize = 1;
const maxSize = 6;
const minSpeed = 1;
const maxSpeed = 5.5;

// Loading Resources Checker
let resourcesLoaded = {
    table: false,
    sounds: {
        biomass: false,
        wind: false,
        geothermal: false,
        hydro: false,
        photovoltaic: false
    }
};

// Configuration for colors used in visualization
const config = {
    colorValues: {
        Biomass: [154, 205, 50],
        Wind: [211, 211, 211],
        Photovoltaic: [186, 184, 108], //mm
        Geothermal: [207, 16, 32], //mm
        Hydro: [23, 103, 215],
        highlight: {
            Biomass: [57, 255, 20], //
            Wind: [255, 250, 250],
            Photovoltaic: [255, 215, 0], //mm
            Geothermal: [255, 69, 0], //mm
            Hydro: [118, 182, 196]
        }
    }
};

// Preload function for loading data and sounds before visualization starts
function preload() {
    loadTable('data/dailyproduction.csv', 'csv', 'header', (table) => {
        resourcesLoaded.table = true;
        productionData = table;
        checkAllResourcesLoaded();
    });

    loadSound('sounds/Biomass.mp3', (sound) => {
        resourcesLoaded.sounds.biomass = true;
        soundBiomass = sound;
        checkAllResourcesLoaded();
    });

    loadSound('sounds/Wind.mp3', (sound) => {
        resourcesLoaded.sounds.wind = true;
        soundWind = sound;
        checkAllResourcesLoaded();
    });

    loadSound('sounds/Geothermal.mp3', (sound) => {
        resourcesLoaded.sounds.geothermal = true;
        soundGeothermal = sound;
        checkAllResourcesLoaded();
    });

    soundHydro = loadSound('sounds/Hydro.mp3', (sound) => {
        resourcesLoaded.sounds.hydro = true;
        soundHydro = sound;
        checkAllResourcesLoaded();
    });

    soundPhotovoltaic = loadSound('sounds/Photovoltaic.mp3', (sound) => {
        resourcesLoaded.sounds.photovoltaic = true;
        soundPhotovoltaic = sound;
        checkAllResourcesLoaded();
    });
}

function checkAllResourcesLoaded() {
    if (resourcesLoaded.table &&
        resourcesLoaded.sounds.biomass &&
        resourcesLoaded.sounds.wind &&
        resourcesLoaded.sounds.geothermal &&
        resourcesLoaded.sounds.hydro &&
        resourcesLoaded.sounds.photovoltaic) {

        var buttonStartFull = document.getElementById('StartFull');
        var buttonStart = document.getElementById('Start');
        buttonStartFull.removeAttribute('disabled');
        buttonStart.removeAttribute('disabled');
        var startText = document.getElementById('StartText');
        startText.innerHTML = "Welcome! For an immersive experience of this Data Painting, we recommend using a large screen and turning on the speakers";
        var loadingIcon = document.getElementById('LoadingIcon');
        loadingIcon.style.display = 'none';
    }
}

// Function to handle initial full-screen start of the visualization
function onStartFull() {
    document.getElementById('loadingScreen').style.display = 'none'; // Hide loading screen
    lastUpdate = 0; // Reset last update time
    soundEnabled = true; // Enable sound
    setSoundsOnIcon(false); // Update sound icon
    loop(); // Start p5.js drawing loop
}

// Function to handle start of the visualization without full screen
function onStart() {
    document.getElementById('loadingScreen').style.display = 'none'; // Hide loading screen
    lastUpdate = 0; // Reset last update time
    soundEnabled = false; // Disable sound
    setSoundsOnIcon(true); // Update sound icon
    loop(); // Start p5.js drawing loop
}

// Setup function for initializing the visualization environment
function setup() {
    canvas = createCanvas(0, 0); // Create a canvas element
    canvas.parent('renewable-canva'); // Set parent container for the canvas
    resizeCanvasToParent(); // Adjust canvas size to fit parent container

    // Process each row from the loaded production data
    productionData.getRows().forEach(row => {
        const date = row.getString("Date");
        const energySource = row.getString("Energy Source");
        const generation = row.getNum("Renewable Generation [GWh]");
        storeData(date, energySource, generation); // Store data for later use
    });
    createParticlesFromData(); // Create particle objects based on stored data
    dates = Object.keys(dailyData).sort(); // Sort dates for chronological animation
    cols = floor(width / scl); // Calculate number of columns for flow field grid
    rows = floor(height / scl); // Calculate number of rows for flow field grid
    initializeFlowFields(); // Initialize flow fields for each energy type
    noLoop(); // Stop the drawing loop until started explicitly
}

// Function triggered by touch press, used to control playback and resizing
function touchStarted() {
    if (touches && touches[0].x > 0 && touches[0].x < width && touches[0].y > 0 && touches[0].y < height && lastUpdate >= 0) {
        //performCanvaTouch();
        performCanvaTouch();
    }
}

// Function triggered by mouse press, used to control playback and resizing
function mousePressed() {
    if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height && lastUpdate >= 0) {
        //performCanvaTouch();
        performCanvaTouch();
    }
}

// Function to toggle volume based on current state
function onEnableVolume() {
    if (soundEnabled) {
        setSoundsOnIcon(true); // Update sound icon
        soundEnabled = false; // Disable sound
        resetAndRestart(); // Reset and restart the visualization
    } else {
        setSoundsOnIcon(false); // Update sound icon
        soundEnabled = true; // Enable sound
        resetAndRestart(); // Reset and restart the visualization
    }
}

// Function to handle pause button click, toggling play/pause
function onClickPause() {
    playAndPause(); // Play or pause the animation and sounds
}

// Function to handle redirection to a research paper
function onGoToPaper() {
    window.open('https://www.thewhatifproject.com/wp-content/uploads/2024/05/Renewable_Rhytms_Paper.pdf', '_blank'); // Open link in a new tab
}

// Function to refresh and restart the entire canvas and visualization
function onRefreshCanvas() {
    resetAndRestart(); // Reset and restart the visualization
}

// Function to save the current state of the canvas as a JPEG image
function onSaveCanvas() {
    saveCanvas('myRenewableSnap', 'jpg'); // Save canvas to file
}

// Function to toggle full screen mode
function onFullScreen() {
    //let fs = fullscreen(); // Get current full screen state
    //fullscreen(!fs); // Toggle full screen mode
    resizeCanvasToParent(); // Adjust canvas size
    handleFullScreen(); // Handle visibility of UI panels
    resetAndRestart(); // Reset and restart the visualization
    isCanvaFull = true; // Toggle full screen state
}

// Function to toggle visibility of labels and adjust canvas size
function onToggleLabels() {
    resizeCanvasToParent(); // Adjust canvas size
    handlePartialScreen(); // Handle visibility of UI panels
    resetAndRestart(); // Reset and restart the visualization
}

function performCanvaTouch() {
    if (isCanvaFull) {
        handleFullScreen(); // Handle visibility of UI panels
        resizeCanvasToParent(); // Adjust canvas size
        if (!isLooping()) {
            playAndPause(); // Play or pause the animation and sounds
        }
    } else if (isLooping()) {
        clickToDisturb(); // Play or pause the animation and sounds
    }
}

function clickToDisturb() {
    let clickPoint = createVector(mouseX, mouseY);
    let forceRadius = 200; // Distanza entro la quale le particelle saranno influenzate

    particles.forEach(particle => {
        let distance = p5.Vector.dist(clickPoint, particle.pos);
        if (distance < forceRadius) {
            let force = p5.Vector.sub(particle.pos, clickPoint); // Crea una forza che spinge via dal punto di click
            force.div(distance); // Normalizza e inverte la forza per diminuire con la distanza
            particle.vel.add(force.mult(8)); // Moltiplica per una costante per regolare l'intensità della forza
        }
    });
}

// Utility function to manage visibility of side panels in the UI
function handleFullScreen() {
    // Toggle visibility of the left panel
    let leftPanel = document.querySelector('.left-panel');
    leftPanel.style.display = leftPanel.style.display === 'none' ? 'flex' : 'none';

    // Toggle visibility of the right panel
    let rightPanel = document.querySelector('.right-panel');
    rightPanel.style.display = rightPanel.style.display === 'none' ? 'flex' : 'none';

    // Toggle visibility of buttons in the right panel
    let buttons = document.querySelectorAll('.right-panel .right-button');
    buttons.forEach(button => {
        button.style.display = button.style.display === 'none' ? 'flex' : 'none';
    });

    isCanvaFull = isCanvaFull ? false : true; // Toggle full screen state
    resizeCanvasToParent(); // Adjust canvas size
}

// Utility function to manage visibility of side panels in the UI
function handlePartialScreen() {
    // Toggle visibility of the left panel
    let leftPanel = document.querySelector('.left-panel');
    leftPanel.style.display = leftPanel.style.display === 'none' ? 'flex' : 'none';

    // Toggle visibility of buttons in the right panel
    let buttons = document.querySelectorAll('.right-panel .right-button');
    buttons.forEach(button => {
        if (button.id !== 'ToogleLabels') {
            button.style.display = button.style.display === 'none' ? 'flex' : 'none';
        }
    });
    resizeCanvasToParent(); // Adjust canvas size
}

// Function to control play/pause state of the animation and sound
function playAndPause() {
    var icon = document.getElementById('PlayPauseIcon'); // Get play/pause icon element
    if (isLooping()) {
        noLoop(); // Stop the drawing loop
        pauseSounds(); // Pause all sounds
        switchAudioButton(true); // Update audio button state
        icon.src = 'icons/play.png'; // Set icon to play
    } else {
        loop(); // Start the drawing loop
        playSounds(); // Play all sounds
        switchAudioButton(false); // Update audio button state
        icon.src = 'icons/pause.png'; // Set icon to pause
    }
}

// Function to update the sound icon based on whether sound is enabled
function setSoundsOnIcon(enabled) {
    var icon = document.getElementById('SoundsOnOffIcon'); // Get sound on/off icon element
    enabled ? icon.src = 'icons/volume.png' : icon.src = 'icons/mute.png'; // Set icon based on sound state
}

// Utility function to retrieve the appropriate sound object based on energy type
function getSoundForEnergyType(type) {
    switch (type) {
        case 'Biomass':
            return soundBiomass;
        case 'Wind':
            return soundWind;
        case 'Geothermal':
            return soundGeothermal;
        case 'Hydro':
            return soundHydro;
        case 'Photovoltaic':
            return soundPhotovoltaic;
        default:
            return null; // Return null if no match found
    }
}

// Function to set custom volume for all sounds
function setCustomVolume(volume) {
    soundBiomass.setVolume(volume);
    soundWind.setVolume(volume);
    soundGeothermal.setVolume(volume);
    soundHydro.setVolume(volume);
    soundPhotovoltaic.setVolume(volume);
}

// Function to play all sounds if sound is enabled
function playSounds() {
    if (soundEnabled) {
        soundBiomass.play();
        soundWind.play();
        soundGeothermal.play();
        soundHydro.play();
        soundPhotovoltaic.play();
    }
}

// Function to pause all sounds if sound is enabled
function pauseSounds() {
    if (soundEnabled) {
        soundBiomass.pause();
        soundWind.pause();
        soundGeothermal.pause();
        soundHydro.pause();
        soundPhotovoltaic.pause();
    }
}

// Function to set all sounds to loop, ensuring continuous playback
function initSounds() {
    soundBiomass.loop();
    soundWind.loop();
    soundGeothermal.loop();
    soundHydro.loop();
    soundPhotovoltaic.loop();
}

// Function to stop all sounds
function stopSounds() {
    soundBiomass.stop();
    soundWind.stop();
    soundGeothermal.stop();
    soundHydro.stop();
    soundPhotovoltaic.stop();
}

// Utility function to disable or enable the sound toggle button
function switchAudioButton(disabled) {
    var button = document.getElementById('SoundsOnOff');
    if (disabled) {
        button.setAttribute('disabled', 'disabled');
    } else {
        button.removeAttribute('disabled');
    }
}

// Function to reset and restart the entire visualization and sound system
function resetAndRestart() {
    noLoop(); // Stop the drawing loop
    stopSounds(); // Stop all sounds
    clear(); // Clear the canvas
    particles = []; // Reset particles array
    particlesForToday = {}; // Reset particles for the current day
    flowfields = {}; // Reset flow fields
    energyTotals = {}; // Reset energy totals
    dailyData = {}; // Reset daily data
    dates = []; // Reset dates array
    currentDateIndex = 0; // Reset current date index
    lastUpdate = 0; // Reset last update time
    zoff = 0; // Reset z offset for noise function
    isCanvaFull = false; // Reset full screen state
    maxEnergyValueDay = 0; // Reset maximum energy value for a day
    document.getElementById('PlayPauseIcon').src = 'icons/pause.png'; // Get play/pause icon element
    setup(); // Re-run setup to reinitialize the environment
    loop(); // Start the drawing loop
}

// Function to handle window resizing, adjusts canvas size to fit parent container
function windowResized() {
    resizeCanvasToParent(); // Adjust canvas size
}

// Utility function to resize the canvas to match the dimensions of its parent container
function resizeCanvasToParent() {
    let centerPanel = document.getElementById('renewable-canva'); // Get the parent container element
    let w = centerPanel.offsetWidth; // Get the width of the parent container
    let h = centerPanel.offsetHeight; // Get the height of the parent container
    resizeCanvas(w, h); // Resize canvas to match parent dimensions
}

// Function to update the user interface with current date and energy totals
function updateUI(currentDate) {
    if (!currentDate) return; // If no current date is provided, exit the function
    const formattedDate = currentDate.split('-').reverse().join('/'); // Format the current date
    document.getElementById('Date-value').innerText = `${formattedDate}`; // Update the date display

    let energyTotalsToday = dailyData[currentDate] || {}; // Retrieve energy totals for the current date
    energyTotalsToday.forEach(dailyObj => {
        if (document.getElementById(dailyObj.energyType + "-value")) {
            document.getElementById(dailyObj.energyType + "-value").innerText = (`${dailyObj.energyValue.toFixed(2)} GWh`); // Update the display for each energy type
        }
    });
}

// Function to store daily production data in a structured format
function storeData(date, source, generation) {
    if (!dailyData[date]) {
        dailyData[date] = []; // Initialize an empty array for new dates
    }
    dailyData[date].push({
        source,
        generation
    }); // Store production data for the given date
}

// Function to create particle objects based on the stored daily data
function createParticlesFromData() {
    for (let date in dailyData) {
        let dailyGenerations = dailyData[date].map(data => data.generation); // Extract generation values for the date
        let maxEnergyValueDay = Math.max(...dailyGenerations); // Determine the maximum generation value for the date
        dailyData[date] = dailyData[date].map(data => new Particle(
            data.source,
            data.generation,
            maxEnergyValueDay, // Use the maximum daily generation as a scaling factor
            config.colorValues[data.source],
            config.colorValues.highlight[data.source]
        )); // Create a new particle for each data entry
    }
}

// Function to initialize flow fields for each energy type
function initializeFlowFields() {
    let energyTypes = {
        Biomass: 0,
        Wind: 0,
        Photovoltaic: 0,
        Geothermal: 0,
        Hydro: 0
    }; // Define energy types and initialize them to zero

    Object.keys(energyTypes).forEach(type => {
        updateFlowField(type, 0, null, null); // Initialize flow fields for each energy type with zero values
    });
}

// Function to update the flow field for a specific energy type
function updateFlowField(type, zoff, energyValueForType, maxEnergyValueDay) {
    let field = flowfields[type] = []; // Initialize or reset the flow field for the energy type
    let yoff = 0; // Initialize y offset for noise calculation
    for (let y = 0; y < rows; y++) {
        let xoff = 0; // Initialize x offset for noise calculation
        for (let x = 0; x < cols; x++) {
            let index = x + y * cols; // Calculate index in the flow field array
            let angle; // Variable to hold the calculated angle
            if (!energyValueForType || !maxEnergyValueDay) {
                angle = noise(xoff, yoff, zoff) * TWO_PI; // Calculate angle using Perlin noise
            } else {
                angle = noise(xoff, yoff, zoff) * TWO_PI * (energyValueForType / maxEnergyValueDay); // Adjust angle based on energy generation ratio
            }
            let adjustedMagnitude = Math.sqrt(energyValueForType) / Math.sqrt(maxEnergyValueDay); // Calculate magnitude based on square root of energy ratio
            let magnitude = Math.max(0.1, map(adjustedMagnitude, 0, 1, 0.1, 1)); // Scale magnitude between 0.1 and 1
            field[index] = p5.Vector.fromAngle(angle).setMag(magnitude); // Create vector for flow field direction and magnitude
            xoff += inc; // Increment x offset
        }
        yoff += inc; // Increment y offset
    }
}

// Draw function, called repeatedly to render the visualization
function draw() {
    if (lastUpdate < 0) {
        return; // If not yet initialized, exit the function
    }
    let currentTime = millis(); // Get current time in milliseconds
    if (currentTime - lastUpdate > updateInterval) {
        updateBackground(); // Update the background color
        drawFrame(); // Draw the frame around the canvas
        particles.forEach(particle => {
            particle.show(); // Display each particle
        });
        if (soundEnabled && lastUpdate === 0) {
            initSounds(); // Initialize sounds if sound is enabled and it's the first update
        }
        updateParticles(); // Update particle positions and states
        lastUpdate = currentTime; // Update last update time
    }
}

// Function to draw a frame around the canvas
function drawFrame() {
    if (!isCanvaFull) {
        stroke(255); // Set stroke color to white
        strokeWeight(0.1); // Set stroke weight
        noFill(); // No fill for the rectangle
        rect(2, 2, width - 4, height - 4); // Draw a rectangle inside the canvas edges
    }
}

// Function to update the background color based on the time of day
function updateBackground() {
    let dayPhase = (TWO_PI * currentDateIndex) / dates.length; // Calculate the phase of the day
    let bgColor = lerpColor(color(30, 30, 30), color(0, 0, 0), (sin(dayPhase) + 1) / 2); // Interpolate between two colors based on the day phase
    background(bgColor); // Set the background color
}

// Function to update particles and flow fields based on the current date
function updateParticles() {
    if (currentDateIndex < dates.length && dates.length > 0) {
        let currentDate = dates[currentDateIndex]; // Get the current date
        let particlesForToday = dailyData[currentDate]; // Retrieve particles for the current date
        let maxEnergyValueDay = Math.max(...particlesForToday.map(p => p.energyValue)); // Calculate the maximum energy value for the current date

        let energyValuesByType = new Map(); // Initialize a map to store energy values by type
        particlesForToday.forEach(particle => {
            energyValuesByType.set(particle.energyType, particle.energyValue); // Store energy value for each particle type
        });

        Object.keys(flowfields).forEach(type => {
            let energyValueForType = energyValuesByType.get(type); // Retrieve energy value for the type
            if (energyValueForType !== undefined) {
                updateFlowField(type, zoff, energyValueForType, maxEnergyValueDay); // Update flow field for the type
            }
        });
        zoff += 0.01; // Increment z offset for flow field animation
        particles = particles.concat(particlesForToday).filter(particle => {
            particle.follow(flowfields[particle.energyType]); // Make particle follow the flow field
            particle.update(); // Update particle state
            return particle.isActive(); // Filter out inactive particles
        });
        updateUI(currentDate); // Update user interface with current date and energy values
        currentDateIndex++; // Increment date index
    }
    if (currentDateIndex >= dates.length && dates.length > 0) {
        resetAndRestart(); // Reset and restart the visualization if all dates have been processed
    }
}

// Class representing a particle in the visualization
class Particle {
    constructor(energyType, energyValue, maxEnergyValue, baseColor, highlightColor) {
        this.pos = createVector(random(width), random(height)); // Initialize position with random coordinates within the canvas
        this.vel = createVector(0, 0); // Initialize velocity vector
        this.acc = createVector(0, 0); // Initialize acceleration vector
        this.energyType = energyType; // Store energy type
        this.energyValue = energyValue; // Store energy value
        this.energyRatio = pow(this.energyValue / maxEnergyValue, 0.3); // Calculate energy ratio, used for scaling properties
        this.age = 0; // Initialize age of the particle
        this.maxspeed = map(this.energyRatio, 0, 1, minSpeed, maxSpeed); // Calculate maximum speed based on energy ratio
        this.maxsize = map(this.energyRatio, 0, 1, minSize, maxSize); // Calculate maximum size based on energy ratio
        this.size = minSize; // Set initial size to minimum
        this.lifespan = lifeSpan; // Set lifespan
        this.volume = map(this.energyRatio, 0, 1, 0.1, 0.7); // Calculate volume for sound playback based on energy ratio
        this.pitch = map(this.energyRatio, 0, 1, 0.1, 0.5); // Calculate pitch for sound playback based on energy ratio
    }

    // Method for a particle to follow a flow field
    follow(flowfield) {
        let x = floor(this.pos.x / scl); // Calculate x index for the flow field
        let y = floor(this.pos.y / scl); // Calculate y index for the flow field
        let index = x + y * cols; // Calculate overall index in the flow field array
        this.applyForce(flowfield[index]); // Apply force based on flow field vector
    }

    // Method to apply a force to the particle
    applyForce(force) {
        this.acc.add(force); // Add force to acceleration
    }

    // Method to update the particle's state
    update() {
        // Increment the age of the particle
        this.age++;

        this.size = map(this.age, 0, this.lifespan, this.maxsize, minSize); // Update size based on age

        // Calculate minimum distance from the edges of the canvas
        let minDistToEdge = Math.min(this.pos.x, width - this.pos.x, this.pos.y, height - this.pos.y);
        let edgeAlpha = map(minDistToEdge, 0, 40, 0, 255, true); // Calculate opacity based on distance from edges
        let fadeAlpha = map(this.age, 0, this.lifespan, 255, 0); // Calculate fade opacity based on age

        // Handle particle color transitions
        let t = (sin(millis() / 1000) + 1) / 2; // Calculate transition factor
        let baseColor = color(config.colorValues[this.energyType]); // Get base color from configuration
        let highlightColor = color(config.colorValues.highlight[this.energyType]); // Get highlight color from configuration
        let gradientColor = lerpColor(baseColor, highlightColor, t); // Interpolate between base and highlight colors
        gradientColor.setAlpha(min(edgeAlpha, fadeAlpha)); // Set calculated opacity

        this.color = gradientColor; // Update particle color

        if (soundEnabled) {
            let sound = getSoundForEnergyType(this.energyType); // Retrieve sound object for the energy type
            sound.setVolume(this.volume); // Set sound volume
            sound.rate(this.pitch); // Set sound playback rate
            sound.amp(this.volume, 1); // Set sound amplitude
        }

        // Update position and velocity
        this.vel.add(this.acc); // Update velocity by adding acceleration
        this.vel.limit(this.maxspeed); // Limit velocity to maximum speed
        this.pos.add(this.vel); // Update position by adding velocity
        this.acc.mult(0); // Reset acceleration

        // Handle particle behavior at canvas edges
        this.edges();
    }

    // Method to handle particle edges, allowing particles to wrap around the canvas
    edges() {
        if (this.pos.x > width) this.pos.x = 0; // Wrap horizontally from right to left
        if (this.pos.x < 0) this.pos.x = width; // Wrap horizontally from left to right
        if (this.pos.y > height) this.pos.y = 0; // Wrap vertically from bottom to top
        if (this.pos.y < 0) this.pos.y = height; // Wrap vertically from top to bottom
    }

    // Method to check if the particle is still active based on its age
    isActive() {
        return this.age < this.lifespan; // Return true if age is less than lifespan
    }

    // Method to display the particle
    show() {
        // Set fill color to the current particle color
        fill(this.color);
        noStroke(); // Disable stroke to only draw filled shapes
        // Draw an ellipse at the particle's position with the calculated size
        ellipse(this.pos.x, this.pos.y, this.size, this.size);

        // Glow Effect
        let glowIntensity = this.vel.mag() / this.maxspeed;
        let glowSize = this.size * (1 + 0.5 * glowIntensity);
        let glowAlpha = 70 * glowIntensity; // Metà trasparenza massima
        fill(red(this.color), green(this.color), blue(this.color), glowAlpha);
        ellipse(this.pos.x, this.pos.y, glowSize, glowSize);
    }
}
