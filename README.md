# GeoNet
A Javascript based game made with p5.js library, and sound effects sourced from pixabay.com and bensound.com

Commentary On Extensions Used Overview
 - extensions: p5.sound.min.js.
 - It was difficult to create a proper gravity implementation. The code for that portion could be better with more tweaking and finetuning.
 - Please make sure to hit "space" when you reach the flag. Also, click the screen to redeem your reward.
 - I learnt about using objects, arrays, and for loops. These were useful in creating the aesthetic components of the game.

#Chosen Extension: p5.sound.min.js
For this project I made use of the sound extension for p5.js. I decided to focus on utilizing this extension extensively as opposed to using three extensions (but not as extensively).
Using this extension I added jump sound effects, falling sound effects, “Item-collected” sound effects, and Background game music along with end-of-game music.
How the extension was Used
The sound effects were downloaded from pixabay.com, and bensound.com (All mp3 format). They are all kept in the SoundEffects folder within the Assets folder. There are a total of 5 sound effects.
Effect: jumpSound
The song stored in jumpSound variable is played in the keyPressed function for the spacebar keycode: 
 

#Effect: collectedSound
The song stored in collectedSound is played in the checkCollectable function if the character has reached a collectable.
 



#Effect : fallingSound 
The falling sound effect is played whenever the character falls down the canyon. However, I noticed that if I don’t check for the sound effect when the player dies it is played repeatedly. This causes the effect to be distorted (in a cool way) but I decided to just play the original audio.
  

#Effect: backgroundMusic
The song stored in the variable is played via a function startGameMusic. However, the function needs to allow for the game character to initiate the buffer before the music can be played. This results in an error if I do not use a try catch statement. The function is initiated in the main draw function.
    











#Extension: Song
The song stored in the song variable plays when the game is won (flagpole is reached). However, the user needs to click the screen to receive their reward.
 

 
 
