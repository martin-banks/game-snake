#### CODING CHALLENGE
# game-snake
Remake the classic game snake in JavaScript

I'm not trying to create the best version of this game or introduce anything, this a quick coding challenge to understand a write the logic behind a simple game.

### Key targets
	[x] Programatically create a game board.
	[x] Create a snake that continuously moves in a single direction
	[x] If the snake runs into itself or a wall, the game game is over
	[x] Food spawns randomly on the game board, when the snake eats the food (front of snake hits food)
 the snake will grow by one frame
	[x] Record the players scores for each game session and write to local storage

### Bonus points
	Game options for
		[x] Grid size
		[x] Game speed
		[x] Use walls

--

# Learning points
#### Array manipulation.
The basic approach I took with this was to consider each aspect of the game as a series of arrays; the board is an aray of rows, each row is an array of columns. The snake is an array of coordinates and coordinates are an array of values.

This was a great refresher of working with arrays some of which I haven't used in projects before.

#### The 'this' keyword
Using 'this' in the factory functions has forced me to consider scope more while coding, it still feels a bit like trap waiting to trip trip me up but much more confident around it now.

--


# How to play
## Goal
Make your snake as big as possible! Use the arrow keys to change direction eating food as it appears. The more you eat thi higher your score and the bigger the snake grows.

## Controls
Your snake never tops moving! use the arrow keys to move in that direction.

## Winning
Bragging rites only, scores are stored locally try and beat your personal best

## Losing
Game ends if you hit the woll or yourself, choose you path wisely and don't get trapped

--

# Tech
Written in vanilla Javascript (using ES6 features) and a little css, no fancy libraries or build tools we used, harmed or created in this game.

_NOTE_
This game requires a modern browser (Chrome, Firefox, Safari) and a keyboard to play. 
Mobile devices are not supported


## Setup
Creates a grid of divs each with a unique combination of row and columns attributes as tile type.

If walls are eneabled, the perimeter tiles are changed to wall type.

The Snake exists as an array of coordinates, these corodinates are used to target DOM elements and change them to snake type

## Game loop
The "game loop" is a series of interval calls that updates the coordinates for the snake and food drops.

## Updating snake coordinates
	- Calculate new coords based on previous last coord and the direction values and pushes into snake coords
	- If the new coordinates are a blank tile the the first set of coords (back of the snake) are removed
	- If the new coords are dom elements with wall type or snake type then the game ends
	- If the new coords match a food type then no coords are removed (so the nake gets longer) and the score increases by one

## Updating food
food spawns at regular intervals, a randomly chosen tile within the map will be turned into the food type. food types increase score and the size of teh snake. 

If the random tile chosen is not a plain tile type (snake or wall) then another will be randomly chosen until a tile type is chosen.


# TODO
	- Touch input support - for mobile devices
	- On screen buttons for better cross platform supports
	- Modularise code
	- Babel transpile for broader borwser support
	- Game options
		- Starting size
		- Color theme
	- Render in canvas
	- Separate scoreboards into different app setting combinations
	- Sore modifiers based on difficulty (board size and game speed)


