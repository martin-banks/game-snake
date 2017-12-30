// DOM ELEMENTS
// Storing key dom elements
const app = document.querySelector('#app')
const game = document.querySelector('#game')

// Check for mobile devices
const isMobile = /iPad|Android|webOS|iPhone|iPod|Blackberry/.test(navigator.userAgent) && !window.MSStream

// check orientation, assigned to app container later
const orientation = window.innerWidth >= window.innerHeight ? 'landscape' : 'portrait'

// SET INITIAL VARIABLE STATES
// Grid size options
const gridMax = 75
const gridMin = 25
let grid = gridMin
let checker = true
// date is used to capture unique id for localstorage
let date = null
let interval = 100
let score = 0

// Movement - directions
const up = [-1, 0]
const down = [1, 0]
const left = [0, -1]
const right = [0, 1]
// Default direction snake moves in
let direction = right

// temporary variable to prevent double direction change into self
let allowDirectionChange = true

// Walls bound the game map, can be changed by the user but default is on
let allowWalls = true

// Coords the snake starts from
const startPos = () => [
	[Math.floor(grid / 2), Math.floor(grid / 2)],
	[Math.floor(grid / 2) - 1, Math.floor(grid / 2) - 1],
]
let snakeCoords = null
// long snake for testing
// let snakeCoords = [ [1,1], [1,2], [1,3], [1,4], [1,5], [1,6], [1,7], [1,8], [1,9], [1,10], [1,11] ]

let foodCoords = [0, 0]

// The game state updates through an interval
// This global variable is used to store it 
// so it can be cleared at game over
let gameLoop = null
// const foodLoop = null


// Build the game grid
// new Array does not create an array with all methods, 
// so we use the spread operator to convert it
const rows = () => [... new Array(grid)]
const columns = () => [... new Array(grid)]



// TEMPLATES
// UI elements
const ui = {
	start: '<button id="start" data-type="start">New Game</button>',
	reset: '<button id="start" data-type="reset">Play again?</button>',
}
// Main / start screen template
function mainView() {
	return `<div id="mainView" class="uiView">
		<div class="header">
			<h1>Welcome to Snake!</h1>
			<p>Collect food and grow but don't hit the walls (or yourself)</p>
		</div>
		<section class="options">
			<h3>Options</h3>
			<div class="options__gridSize">
				<h4>Grid size</h4>
				<input type="range" list="gridsizes" data-option="gridsize" >
					<datalist id="gridsizes">
					  <option value="0" label="Tiny">
					  <option value="25" label="Small">
					  <option value="50" label="Medium">
					  <option value="75" label="Large">
					  <option value="100" label="Huge">
					</datalist>
				</input>
			</div>
			<div class="options__speed">
				<h4>Game speed</h4>
				<input type="range" list="gamespeeds" data-option="gamespeed">
					<datalist id="gamespeeds">
					  <option value="0" label="">
					  <option value="25" label="">
					  <option value="50" label="">
					  <option value="75" label="">
					  <option value="100" label="">
					</datalist>
				</input>
			</div>
			<div class="options__walls">
				<h4>Use walls</h4>
				<div class="option__toggleWrapper" data-option="wall" data-active="${allowWalls}">
					<span class="option__toggle"></span>
				</div>
			</div>
			<div class="options__checker">
			<h4>Show checker board</h4>
			<div class="option__toggleWrapper" data-option="checker" data-active="${checker}">
				<span class="option__toggle"></span>
			</div>
		</div>
		</section>
		${ui.start}
	</div>`
}

// Template for game over / high scores screen
function gameoverTemplate(hit) {
	const { localStorage } = window
	const topScores = Object.keys(localStorage)
		.sort((a, b) => JSON.parse(localStorage[b]).score - JSON.parse(localStorage[a]).score)
		.slice(0, 5)
		.map(key => {
			const item = JSON.parse(localStorage[key])
			// console.log({ key, date })
			return `<li class="${key === date ? 'newBest' : 'nope'}">
				<h4>Score: ${item.score}</h4>
				<p>Game speed: ${item.speed}</p>
				<p>Grid size: ${item.grid} x ${item.grid}</p>
				<p>Walls: ${item.walls ? 'On' : 'Off'}</p>
			</li>`
		})
		.join('')
	return `<div id="gameOver" class="uiView">
		<div class="content">
			<h3> Game over${hit ? `, you hit ${hit}` : ''}</h3>
			<h1 id="finalScore">Score: ${score} points</h1>
			<h4 class="topScores__title">Your top scores</h4>
			<ul id="topScores">
				${topScores}
			</ul>
			${ui.reset}
		</div>
	</div>`
}
// Template for the game board tiles
function tileTemplate(ri, ci) {
	let type = 'tile'
	if (allowWalls) {
		if (ri === 0 || ci === 0 || ri === (grid - 1) || ci === (grid - 1)) {
			type = 'wall'
		}
	}
	const unit = orientation === 'landscape' ? 'vh' : 'vw'
	const tileSize = (100 / grid) * 0.9
	return `<div 
			data-type="${type}"
			data-row=${ri}
			data-col=${ci}
			style="
				top: 0;
				left: 0;
				width: ${tileSize}${unit};
				height: ${tileSize}${unit};
				transform: translate(${ci * tileSize}${unit}, ${ri * tileSize}${unit})
			"
		></div>`
}
		
		
// RESET GAME ELEMENTS
// Resets all snake tiles to tile type
function resetTiles() {
	const allSnakeTiles = document.querySelectorAll('[data-type=snake]')
	allSnakeTiles.forEach(t => {
		t.setAttribute('data-type', 'tile')
	})
}
// Removes all food elements from the game board
function resetfood() {
	document
		.querySelectorAll('[data-type=food]')
		.forEach(l => l.setAttribute('data-type', 'tile'))
}


// BUILDING THE GAME ELEMENTS
// Build the game board
// Board consists of array of rows, each row has an array of columns
// In order to create this we loop over the columns array, creating a tile for each row
// then return and join all columns and all rows ready to render to the DOM
function makeTiles() {
	return rows()
		.map((r, ri) => `<div data-type="row">${columns().map((c, ci) => tileTemplate(ri, ci)).join('')}</div>`)
		.join('')
}

// Making the snake
// Coords (an array of coord arrays for each part of snake body) are passed in
// These coords are used to find the appropriate dom element
// and set their type attribute to snake (css changes the color)
function makeSnake(coords) {
	coords
		.map(s => document.querySelector(`[data-row="${s[0]}"][data-col="${s[1]}"]`))
		.forEach(s => {
			if (!s) return
			s.setAttribute('data-type', 'snake')
		})
}


// GAME LIFECYCLE
// Coords for the head of the snake are passed in
// These coords are updated with the value in the direction array
// This returns a new set of coords of where the head will be after the snake has 'moved'
// If the new coords would move the snake off the edge of the game board
// then the coords are reset to the opposite end of that row/column
// Wall collision is handled elsewhere
function makeNewCoords(coords) {
	const newRow = coords[0] + direction[0]
	const newCol = coords[1] + direction[1]
	const resetRow = direction === up ? grid : 0
	const resetCol = direction === left ? grid : 0
	const newCoords = [
		((newRow >= 0) && (newRow < grid)) ? newRow : resetRow,
		((newCol >= 0) && (newCol < grid)) ? newCol : resetCol,
	]
	return newCoords
}

// Called in every gameLoop interval to update the state of the game on DOM
function updateGame() {
	let gotfood = false
	// check for food tile
	const newCoords = makeNewCoords(snakeCoords[snakeCoords.length - 1])
	snakeCoords.push(newCoords)
	// console.log(snakeCoords)
	const checkTile = document
		.querySelector(`[data-row="${newCoords[0]}"][data-col="${newCoords[1]}"]`)
	// console.log(checkTile)
	if (allowWalls) {
		if (checkTile && checkTile.getAttribute('data-type') === 'wall') {
			gameOver('the wall')
			return [Math.floor(grid / 2), Math.floor(grid / 2)]
		}
	}
	if (checkTile && checkTile.getAttribute('data-type') === 'snake') {
		gameOver('yourself!')
		return [Math.floor(grid / 2), Math.floor(grid / 2)]
	}
	if (snakeCoords[snakeCoords.length - 1][0] === foodCoords[0] && snakeCoords[snakeCoords.length - 1][1] === foodCoords[1]) {
		gotfood = true
		score++
		document.querySelector('#score').innerHTML = `<p>Score</p><h1>${score}</h1>`
		dropfood()
	}
	if (!gotfood) {
		snakeCoords.shift(1)
	}
	resetTiles()
	makeSnake(snakeCoords)
	allowDirectionChange = true
	gotfood = false
}

// Controls where food is dropped on hte game board
// Randomly chooses a set of coords on the board, 
// if those coords are not a blank tile (snake, wall)
// then a new set are recursively chosen until an empty set is found
function dropfood() {
	resetfood()
	const makeCoords = () => {
		const total = allowWalls ? grid - 2 : grid
		const offset = allowWalls ? 1 : 0
		foodCoords = [Math.floor(Math.random() * total) + offset, Math.floor(Math.random() * total) + offset]
		if (snakeCoords.includes(foodCoords)) {
			return makeCoords()
		}
		document.querySelector(`[data-row="${foodCoords[0]}"][data-col="${foodCoords[1]}"]`)
			.setAttribute('data-type', 'food')
	}
	makeCoords()
}

// Start the game!!
function start() {
	// Store the date for use in localstorage
	date = (new Date()).getTime().toString()
	// create initial snake coords based on the grid size selected by the player
	snakeCoords = [...startPos()]
	// resets the score
	score = 0
	game.setAttribute('data-checker', checker)
	// renders the game board
	game.innerHTML = makeTiles()
	// makes the snake
	makeSnake(snakeCoords)
	// starts the game loop - the snake is now moving!
	gameLoop = setInterval(updateGame, interval)
	// drops first piece of food
	dropfood()
	return 'game started'
}

// Stops the game
function stop() {
	// clears the gameloop interval
	clearInterval(gameLoop)
	gameLoop = null
	return 'game stopped'
}


// GAME OPTIONS
// Get the values from the speed / size sliders
// Sets the values into the appropriate variables based on their data-option attribute
function optionSliderChange() {
	const { value } = this
	const option = this.getAttribute('data-option')
	if (option === 'gamespeed') {
		interval = 50 + (1000 - (1000 * (value / 100)))
	} else if (option === 'gridsize') {
		grid = Math.floor(gridMin + ((gridMax - gridMin) * (value / 100)))
	}
}

// Toggles if walls should be used
function toggleWalls() {
	const status = this.getAttribute('data-active') === 'true'
	this.setAttribute('data-active', !status)
	allowWalls = !status
}

// Toggles if checker board background should be used
function toggleChecker() {
	const status = this.getAttribute('data-active') === 'true'
	this.setAttribute('data-active', !status)
	checker = !status
}


// RENDER GAME VIEWS
// Render the start screen
// This view is used to set game options and start a new game
function renderStartScreen() {
	game.innerHTML = mainView()
	document.querySelectorAll('input').forEach(input => {
		const option = input.getAttribute('data-option')
		const { value } = input
		if (option === 'gamespeed') {
			// interval = 1000 - ((950) * (value / 100))
			interval = 10 + ((150 * (value / 100)))
			return
		} else if (option === 'gridsize') {
			grid = Math.floor(gridMin + ((gridMax - gridMin) * (value / 100)))
			grid = gridMin + ((gridMax - gridMin) * (value / 100))
		}
		input.addEventListener('change', optionSliderChange)
	})
	document.querySelector('[data-option="wall"]').addEventListener('click', toggleWalls)
	document.querySelector('[data-option="checker"]').addEventListener('click', toggleChecker)
}

// Renders the game over view and stores game/score infor to localstorage
function gameOver(hit) {
	stop()
	const saveScore = {
		score,
		grid,
		speed: interval,
		walls: allowWalls,
	}
	window.localStorage.setItem(date, JSON.stringify(saveScore))
	game.innerHTML = gameoverTemplate(hit)
	document.querySelector('#score').innerHTML = ''
}


// HANDLE USER INPUT
// Takes keyCode input and updates the direction array
function updateDirection(key) {
	if (key === 38) { // up arrow
		return direction === down ? down : up
	}	else if (key === 40) { // down arrow
		return direction === up ? up : down
	}	else if (key === 37) { // left arrow
		return direction === right ? right : left
	} else if (key === 39) { // right arrow
		return direction === left ? left : right
	}
	return null
}

// Handles keyboard input
// Game responds to arrows for direction changed 
// and esc for quitting the game
function handleKeyboard(e) {
	const { keyCode } = e
	if (keyCode === 27 && !!gameLoop) { // presses esc
		return gameOver()		
	}
	// Check to see if direction change is allowed
	// Only one change per tick in game loop is allowed
	// this prevents snake running over itself
	if (!allowDirectionChange) return
	allowDirectionChange = false
	const arrows = [38, 40, 37, 39] // up down left right
	// if key press is not an arrow, stop function here
	if (!arrows.includes(keyCode)) return 
	direction = updateDirection(keyCode)
}


// ADD ORIENTATION ATTRIBUTE TO APP CONTAINER
app.setAttribute('data-orientation', orientation)


// ADD EVENT LISTENERS
// Listen for keyboard events
window.addEventListener('keydown', handleKeyboard)
// Delegate istens for click event
// Will call appropriate funtion based on it's type attribute
app.addEventListener('click', e => {
	const { target } = e
	const type = target.getAttribute('data-type')
	if (type === 'start') {
		start()
	} else if (type === 'reset') {
		renderStartScreen()
	}
})


// START THE APP
if (isMobile) {
	// Game does not work on mobile (requires keyboard to play)
	// If mobile is detected, display message
	const message = 'Sorry, this game isn\'t supported on this device yet, a keyboard is required to play'
	window.alert(message)
} else {
	// Call the start screen render function
	renderStartScreen()
}


// 
// TODO
// NEW FEATURES
// 
// 

// Touch input
// window.addEventListener('dragstart', e => {
// 	console.log('dragging', e)
// })
