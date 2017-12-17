const grid = 25
const interval = 100
const lootInterval = 5000
const up = [-1, 0]
const down = [1, 0]
const left = [0, -1]
const right = [0, 1]
let score = 0

const app = document.querySelector('#app')
const game = document.querySelector('#game')
const startButton = document.querySelector('button#start')

const rows = Array.from(new Array(grid))
const columns = Array.from(new Array(grid))
const startPos = [
	[Math.floor(grid / 2), Math.floor(grid / 2)],
	[Math.floor(grid / 2) - 1, Math.floor(grid / 2) - 1],
]
let snakeCoords = startPos

// long snake for testing
// let snakeCoords = [ [1,1], [1,2], [1,3], [1,4], [1,5], [1,6], [1,7], [1,8], [1,9], [1,10], [1,11] ]
let lootCoords = [0, 0]
let direction = right
let gameLoop = null
let lootLoop = null

let allowDirectionChange = true
const allowWalls = true

const ui = {
	start: '<button id="start" data-type="start">New Game</button>',
}
function mainView() {
	return `<div id="mainView" class="uiView">
		<h1>Welcome to Snake!</h1>
		<p>Collect loot and grow but don't hit the walls (or yourself)</p>
		${ui.start}
	</div>`
}
function gameoverTemplate(hit) {
	const { localStorage } = window
	const topScores = Object.keys(localStorage)
		.sort((a, b) => localStorage[b] - localStorage[a])
		.slice(0, 5)
		.map(key => `<li>${localStorage[key]}</li>`)
		.join('')
	return `<div id="gameOver" class="uiView">
		<h3> Game over${hit ? `, you hit ${hit}` : ''}</h3>
		<h1 id="finalScore">Score: ${score} points</h1>
		<h6>Your top scores</h6>
		<ul>
			${topScores}
		</ul>
		<p>Play again?</p>
		${ui.start}
	</div>`
}
function template(ri, ci) {
	let type = 'tile'
	if (allowWalls) {
		if (ri === 0 || ci === 0 || ri === (rows.length - 1) || ci === (columns.length - 1)) {
			type = 'wall'
		}
	}
	return `<div 
		data-type="${type}"
		data-row=${ri}
		data-col=${ci}
		style="
			width: ${(100 / grid)}vw;
			height: ${(100 / grid)}vh;
			transform: translate(${ci * (100 / grid)}vw, ${ri * (100 / grid)}vh)
		"
	></div>`
}
const tiles = rows
	.map((r, ri) => columns.map((c, ci) => template(ri, ci)).join(''))
	.join('')


function makeSnake(coords) {
	coords
		.map(s => document.querySelector(`[data-row="${s[0]}"][data-col="${s[1]}"]`))
		.forEach((s, i) => {
			// console.log(s)
			if (!s) return

			s.setAttribute('data-type', 'snake')
			// s.innerHTML = i
		})
}

function resetTiles() {
	const allSnakeTiles = document.querySelectorAll('[data-type=snake]')
	allSnakeTiles.forEach(t => {
		t.setAttribute('data-type', 'tile')
		// t.innerHTML = ''
	})
}


function makeNewCoords(coords) {
	const newRow = coords[0] + direction[0]
	const newCol = coords[1] + direction[1]
	const walls = allowWalls ? 0 : 1
	const resetRow = direction === up ? (grid - (walls)) : (0 + walls)
	const resetCol = direction === left ? (grid - (walls)) : (0 + walls)
	const newCoords = [
		((newRow >= (0 + walls)) && (newRow < (rows.length - walls))) ? newRow : resetRow,
		((newCol >= (0 + walls)) && (newCol < (columns.length - walls))) ? newCol : resetCol,
	]
	return newCoords
}


function updateGame() {
	let gotLoot = false
	// check for loot tile
	const newCoords = makeNewCoords(snakeCoords[snakeCoords.length - 1])
	snakeCoords.push(newCoords)
	// console.log(snakeCoords)
	const checkTile = document
		.querySelector(`[data-row="${newCoords[0]}"][data-col="${newCoords[1]}"]`)
	// console.log(checkTile)
	if (allowWalls) {
		if (checkTile && checkTile.getAttribute('data-type') === 'wall') {
			gameOver('the wall')
			return [Math.floor(rows.length / 2), Math.floor(columns.length / 2)]
		}
	}
	if (checkTile && checkTile.getAttribute('data-type') === 'snake') {
		gameOver('yourself!')
		return [Math.floor(rows.length / 2), Math.floor(columns.length / 2)]
	}
	if (snakeCoords[snakeCoords.length - 1][0] === lootCoords[0] && snakeCoords[snakeCoords.length - 1][1] === lootCoords[1]) {
		gotLoot = true
		score++
		document.querySelector('#score').innerHTML = `<p>Score</p><h1>${score}</h1>`
		dropLoot()
	}
	if (!gotLoot) {
		snakeCoords.shift(1)
	}
	resetTiles()
	makeSnake(snakeCoords)
	allowDirectionChange = true
	gotLoot = false
}


function resetLoot() {
	document.querySelectorAll('[data-type=loot]')
		.forEach(l => l.setAttribute('data-type', 'tile'))
}


function dropLoot() {
	resetLoot()
	const makeCoords = () => {
		const total = allowWalls ? grid - 2 : grid
		const offset = allowWalls ? 1 : 0
		lootCoords = [Math.floor(Math.random() * total) + offset, Math.floor(Math.random() * total) + offset]
		if (snakeCoords.includes(lootCoords)) {
			return makeCoords()
		}
		// console.log(lootCoords)
		document.querySelector(`[data-row="${lootCoords[0]}"][data-col="${lootCoords[1]}"]`)
			.setAttribute('data-type', 'loot')
		return
	}
	makeCoords()
}

function start() {
	snakeCoords = new Array(...startPos)
	score = 0
	console .log(snakeCoords)
	game.innerHTML = tiles
	makeSnake(startPos)
	// console.log({gameLoop})
	gameLoop = setInterval(updateGame, interval)
	dropLoot()
	// lootLoop = setInterval(dropLoot, lootInterval)
	// console.log({gameLoop})
	return 'game started'
}

function stop() {
	console.log({ gameLoop })
	clearInterval(gameLoop)
	clearInterval(lootLoop)
	gameLoop = null
	return 'game stopped'
}

function gameOver(hit) {
	stop()
	const date = new Date()
	window.localStorage.setItem(date, score)
	game.innerHTML = gameoverTemplate(hit)
	document.querySelector('#score').innerHTML = ''
	
}

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
}

function handleKeyboard(e) {
	if (e.keyCode === 27 && !!gameLoop) { // presses esc
		gameOver()
	}
	if (!allowDirectionChange) return
	allowDirectionChange = false
	const { keyCode } = e
	const arrows = [38, 40, 37, 39]
	// up down left right
	if (!arrows.includes(keyCode)) return
	direction = updateDirection(keyCode)
	// console.log({direction})
}
game.innerHTML = mainView()
window.addEventListener('keydown', handleKeyboard)
// startButton.addEventListener('click', start)

app.addEventListener('click', e => {
	const { target } = e
	if (target.getAttribute('data-type') === 'start') {
		start()
	}
})
