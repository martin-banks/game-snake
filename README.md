# game-snake
Remake of the classic game snake in JavaScript

I'm not trying to create the best version of this game, this a quick remake to see if I can ...


# How to play
## Goal
Make your snake as big as possible. Use the arrow keys to move around the game board eating food. The more you eat thi higher your score and the bigger the snake grows.

## Controls
Your snake never tops moving! use the arrow keys to move in that direction.

## Winning
Bragging rites only, play as long as you can

## Losing
Game ends if you hit the woll or yourself, choose you path wisely and don't get trapped

# Tech
Vanilla Javascript (using ES6 features) web app

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
