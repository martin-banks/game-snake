const grid = 50
const app = document.querySelector('#app')
const rows = Array.from(new Array(grid))
const columns = Array.from(new Array(grid))

const interval = 100
const lootInterval = 10000
const up = [-1, 0]
const down = [1, 0]
const left = [0, -1]
const right = [0, 1]

let startPos = [[50, 50]]
let lootCoords = [0, 0]
let direction = right
let gameLoop = null
let lootLoop = null

let allowDirectionChange = true
const allowWalls = true

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
		.forEach(s => {
			// console.log(s)
			if (!s) return

			s.setAttribute('data-type', 'snake')
		})
}

function resetTiles() {
	const allSnakeTiles = document.querySelectorAll('[data-type=snake]')
	allSnakeTiles.forEach(t => t.setAttribute('data-type', 'tile'))
}


function updateGame() {
	resetTiles()
	const oldCoords = startPos
	startPos = startPos.map(p => {
		const newRow = p[0] + direction[0]
		const newCol = p[1] + direction[1]
		const walls = allowWalls ? 1 : 0
		const resetRow = direction === up ? (100 - (2 * walls)) : (0 + walls)
		const resetCol = direction === left ? (100 - (2 * walls)) : (0 + walls)
		const newCoords = [
			((newRow >= (0 + walls)) && (newRow < (rows.length - walls))) ? newRow : resetRow,
			((newCol >= (0 + walls)) && (newCol < (columns.length - walls))) ? newCol : resetCol,
		]
		if (allowWalls) {
			if (newRow === 0 || newRow === rows.length - 1 || newCol === 0 || newCol === columns.length - 1) {
				stop()
				window.alert('Game over')
				return [Math.floor(rows.length / 2), Math.floor(columns.length / 2)]
			}
		}

		return newCoords
	})
	if (startPos[0][0] === lootCoords[0] && startPos[0][1] === lootCoords[0]) {
		startPos.push(oldCoords[oldCoords.length - 1])
		console.log('Loot!', startPos)
	}
	makeSnake(startPos)
	allowDirectionChange = true
}

function resetLoot() {
	document.querySelectorAll('[data-type=loot]')
		.forEach(l => l.setAttribute('data-type', 'tile'))
}


function dropLoot() {
	resetLoot()
	const makeCoords = () => {
		lootCoords = [Math.floor(Math.random() * rows.length), Math.floor(Math.random() * rows.length)]
		if (startPos.includes(lootCoords)) {
			return makeCoords()
		}
		console.log(lootCoords)
		document.querySelector(`[data-row="${lootCoords[0]}"][data-col="${lootCoords[1]}"]`)
			.setAttribute('data-type', 'loot')
		return
	}
	makeCoords()
}

function start() {
	app.innerHTML = tiles
	makeSnake(startPos)
	// console.log({gameLoop})
	gameLoop = setInterval(updateGame, interval)
	lootLoop = setInterval(dropLoot, lootInterval)
	// console.log({gameLoop})
	return 'game started'
}

function stop() {
	console.log({gameLoop})
	clearInterval(gameLoop)
	clearInterval(lootLoop)
	return 'game stopped'
	console.log({gameLoop})
}

function updateDirection(key) {
	if (key == 38) {
		// up arrow
		return direction === down ? down : up
	}	else if (key == 40) {
		// down arrow
		return direction === up ? up : down
	}	else if (key == 37) {
		// left arrow
		return direction === right ? right : left
	} else if (key == 39) {
		// right arrow
		return direction === left ? left : right
	}
}

function handleKeyboard(e) {
	if (!allowDirectionChange) return
	allowDirectionChange = false
	const { keyCode } = e
	const arrows = [ 38, 40, 37, 39 ]
	// up down left right
	if (!arrows.includes(keyCode)) return
	direction = updateDirection(keyCode)
	// console.log({direction})
}

window.addEventListener('keydown', handleKeyboard)
start()