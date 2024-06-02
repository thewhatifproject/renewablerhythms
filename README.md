# Renewable Rhythms: Visualizing Energy Transition through Ethical AI-Data Driven Creative Coding
![Renewable Rhythms](https://github.com/thewhatifproject/renewablerhythms/assets/171494923/b67d42ef-82e8-4530-a71d-7d375733b24f)

## Abstract
Renewable Rhythms is an exploratory project that utilizes public data on renewable energy production in Italy to create a visual narrative. This project integrates data-driven methodologies, ethical AI, creative coding practices, and mathematical functions to transform raw data into an immersive AI-driven data painting. The visualization reflects the ongoing global transition to renewable energy sources, showcasing the dynamics of energy production from biomass, photovoltaic, hydroelectric, geothermal, and wind sources.

## Installation

### Clone the repository:
```sh
git clone https://github.com/thewhatifproject/renewablerhythms.git
cd renewablerhythms
```

## File Structure
The following is the directory structure to prepare for the project:

RenewableRhythms/\
│\
├── data/\
│ └── dailyproduction.csv # Place your CSV file containing daily production data here\
│\
├── sounds/\
│ ├── Biomass.mp3 # Place your Biomass sound file here\
│ ├── Wind.mp3 # Place your Wind sound file here\
│ ├── Geothermal.mp3 # Place your Geothermal sound file here\
│ ├── Hydro.mp3 # Place your Hydro sound file here\
│ └── Photovoltaic.mp3 # Place your Photovoltaic sound file here\
│\
├── lib/\
│ ├── p5.min.js # p5.js library\
│ └── p5.sound.min.js # p5.js sound library\
│\
├── index.html # Main HTML file in the repo\
├── sketch.js # Main JavaScript file containing the p5.js code in the repo

### Usage
To run the project, open the `index.html` file in a web browser.

## Research Introduction
The global energy sector is undergoing a significant transformation towards renewable energy to mitigate the effects of climate change and reduce dependency on non-renewable resources. Visualizing these changes can enhance public awareness and understanding. Renewable Rhythms employs creative coding to convert renewable energy production data into dynamic visualizations that embody the fluidity and variability inherent in natural processes.

This research is part of The "What If" Project, a collective that explores the intersections between creativity, artificial intelligence, and art to create digital experiences. The data painting "Renewable Rhythms" is available at [The What If Project](https://thewhatifproject.com/renewable/index.html).

## Methodology
![Logical Diagram](https://github.com/thewhatifproject/renewablerhythms/assets/171494923/cd10e83e-5275-4529-95ab-7db06f129bca)

### Data Collection
The project uses public datasets detailing daily renewable energy production in Italy from various sources, starting from 2019 to the present. These datasets include information on the date, type of energy, and amount of energy generated.

### Data Painting Engine
Each energy type is represented by particles that move across a digital canvas. The movements of these particles are influenced by a flow field, an invisible vector field that directs the particles’ paths, akin to natural currents.

### Perlin Noise Function
To simulate natural motion, the project uses Perlin noise—a gradient noise function that creates visually smooth, coherent random patterns. This function is defined as:
```math
N(x, y) = \sum_{i=1}^n a_i \cdot \text{noise}(f_i \cdot (x, y))
```
where $\(a_i\)$ are amplitude coefficients and $\(f_i\)$ are frequency coefficients.

### Particle System
Particles vary in speed, size, blur, and color intensity based on the amount of energy produced daily. Higher energy outputs result in more vigorous and lively particle movements, providing a visual representation of energy production levels. The velocity \(\mathbf{v}\) of a particle at position \(\mathbf{p}\) influenced by the flow field \(\mathbf{F}\) can be described as:
```math
\mathbf{v}(t) = \mathbf{F}(\mathbf{p}(t))
```

### Ethical AI Contributions
The AI enhances the project by automating parts of the creative coding process. The project leverages the capabilities of Large Language Models (LLMs) to co-generate programming code, working in tandem with human programmers. This approach maximizes both efficiency and creative output.

## Implementation
![Implementation Diagram](https://github.com/thewhatifproject/renewablerhythms/assets/171494923/6d6060a1-1b06-4586-8952-f7e3e990847e)

The Data Painting is realized through a synergistic approach that combines the strengths of AI and human expertise. The implementation utilizes the p5.js library, known for its inclusivity and broad accessibility.

### Sound System Dynamics
The sound component enriches the interactive experience. Each energy source is associated with a unique sound, and the volume and pitch of the sound vary according to the energy production values:
```math
\text{volume} = \text{minVolume} + (\text{maxVolume} - \text{minVolume}) \times \left( \frac{\text{energyValue}}{\text{maxEnergyValue}} \right)
```
```math
\text{pitch} = \text{minPitch} + (\text{maxPitch} - \text{minPitch}) \times \left( \frac{\text{energyValue}}{\text{maxEnergyValue}} \right)
```

### Particle Characteristics
Each particle represents a unique measurement of energy produced by different renewable sources. The attributes of particles, such as size, speed, and color, are dynamically adjusted based on the energy production values. For instance:
```math
\text{size} = \text{minSize} + (\text{maxSize} - \text{minSize}) \times \left( \frac{\text{energyValue}}{\text{maxEnergyValue}} \right)^{0.3}
```
```math
\text{velocity} = \mathbf{v}(t) = \mathbf{F}(\mathbf{p}(t))
```

### Flow Field Generation
The flow field is generated using Perlin noise, ensuring smooth transitions and natural movement. The magnitude and direction of each vector in the flow field are influenced by the noise function:
```math
\mathbf{F}(x, y, t) = \nabla \text{Perlin}(x, y, z(t))
```

### Interaction and Control
The visualization allows user interaction through mouse and touch inputs, enabling control over playback, sound, and screen modes. For instance, clicking on the canvas influences the particles' movement, creating a ripple effect:
```math
\mathbf{F}_{\text{click}}(x, y) = \mathbf{F}(x, y) + k \cdot \frac{\mathbf{p} - \mathbf{p}_{\text{click}}}{|\mathbf{p} - \mathbf{p}_{\text{click}}|}
```

### Fade Function for Particles
Particles have a limited lifespan and a fade function that determines their transparency over time:
```math
\alpha(t) = \max\left(0, 1 - \frac{t}{\text{lifespan}}\right)
```

### Color Map for Particles
- Biomass: RGB(154, 205, 50)
- Wind: RGB(211, 211, 211)
- Photovoltaic: RGB(186, 184, 108)
- Geothermal: RGB(207, 16, 32)
- Hydro: RGB(23, 103, 215)

### Highlight Colors
- Biomass Highlight: RGB(57, 255, 20)
- Wind Highlight: RGB(255, 250, 250)
- Photovoltaic Highlight: RGB(255, 215, 0)
- Geothermal Highlight: RGB(255, 69, 0)
- Hydro Highlight: RGB(118, 182, 196)

### Glow Effect
Particles exhibit a glow effect that varies based on their velocity intensity:
```math
\text{glowIntensity} = \frac{\|\mathbf{v}\|}{\text{maxspeed}}
```
```math
\text{glowSize} = \text{size} \times (1 + 0.5 \times \text{glowIntensity})
```
```math
\text{glowAlpha} = 70 \times \text{glowIntensity}
```

## Results
The interactive canvas allows users to visualize the fluctuating nature of renewable energy production. The use of color intensity, particle speed, and flow dynamics effectively conveys the energy output’s variability and the transition towards more sustainable energy sources.

## Discussion
This project demonstrates the potential of integrating creativity with data science and AI to educate and engage the public on critical issues such as energy sustainability. The visual and interactive elements help in making complex data comprehensible and engaging for a broad audience. The human aspect of programming and design remains essential, ensuring that the AI’s capabilities are directed towards meaningful and ethically grounded applications.

## Conclusion
Renewable Rhythms highlights the power of data visualization in storytelling, particularly in the context of significant global challenges. The project not only raises awareness about renewable energy but also showcases the synergy between technology, art, and human creativity. By emphasizing the importance of data as a tool to communicate and sensitize public opinion on the energy transition, it also underlines the critical role of human oversight in the realm of AI, ensuring that technology enhances rather than replaces the human touch.

# Contributing
Contributions are welcome! Please fork the repository and create a pull request.

# License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

# References
- Perlin Noise, [Wikipedia](https://en.wikipedia.org/wiki/Perlin_noise)
- P5JS, [p5js.org](https://p5js.org/)
- Transparency Report Data, [Terna](https://www.terna.it/)

