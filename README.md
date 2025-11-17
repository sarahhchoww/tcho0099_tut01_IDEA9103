# Individual prototype for major assignment of IDEA9103
## How to interact
There is no need for any user input. You may just sit back and enjoy how the circles orbit around one and other and the stars float around. With each refresh, the position and color of the circle changes.
## Mechanism of my work
I have modified the group work with <b>Perlin noise and randomness</b></br>
### Animation
The size of the circles, the white dots in the background, and the colors of the circles are set to animate. Perlin noise has been used to create smoother animations. For example, if perlin noise has not been used for the color animation, the colors would keep flashing which breaks the tranquility of the rest of the work.</br>
### Originality
In addition to the gorup work, this sketch now looks more like the galaxy as the cirlces are in circular movement. This is well thought through, as the magnitude and direction of movement has a great impact for the big picture. Their movement is set in a circular route at different angles and speeds, morderated by perlin noise. </br>
To match the theme, the white dots in the background also danced in the same way. Their randomised alpha values also provided visual depth. The rotating 'dash rings' also gives the feeling of 'self rotating planets'.</br>
Moreover, with reference to the following images, a layer of dots was added to the background to model the star-studded galaxy. Most of dots are in a relatively dark color, with only some in a lighter tone to give a subtle feeling. The density of the dots are adjusted, so that the galaxy-dots fills the canvas, but the white dots, the brighter and larger stars, now rarer, will now stand out more than in the group work.
### Reference image
![Aboriginal art on the Galaxy](AboriginalGalaxy.jpg) </br>
Short technical explanation here </br>
The first step is to remove noLoop() since my work involves animation. This will prevent the sketch from being static.</br>
