const grid = 50
const app = document.querySelector('#app')
const rows = Array.from(new Array(grid))
const columns = Array.from(new Array(grid))

const interval = 100
const lootInterval = 5000
const up = [-1, 0]
const down = [1, 0]
const left = [0, -1]
const right = [0, 1]
let score = 0

// let startPos = [[Math.floor(grid / 2), Math.floor(grid / 2)]]
// long snake for testing
let startPos = [
	[1,1],
	[1,2],
	[1,3],
	[1,4],
	[1,5],
	[1,6],
	[1,7],
	[1,8],
	[1,9],
	[1,10],
	[1,11]
]
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


// function updateGame() {
// 	resetTiles()
// 	const oldCoords = startPos
// 	let gotLoot = false
// 	startPos = startPos.map(p => {
// 		// console.log(p)
// 		const newRow = p[0] + direction[0]
// 		const newCol = p[1] + direction[1]
// 		const walls = allowWalls ? 1 : 0
// 		const resetRow = direction === up ? (100 - (2 * walls)) : (0 + walls)
// 		const resetCol = direction === left ? (100 - (2 * walls)) : (0 + walls)
// 		const newCoords = [
// 			((newRow >= (0 + walls)) && (newRow < (rows.length - walls))) ? newRow : resetRow,
// 			((newCol >= (0 + walls)) && (newCol < (columns.length - walls))) ? newCol : resetCol,
// 		]
// 		const checkTile = document.querySelector(`[data-row="${newRow}"][data-col="${newCol}"]`)
// 		if (allowWalls) {
// 			// if (newRow === 0 || newRow === rows.length - 1 || newCol === 0 || newCol === columns.length - 1) {

// 			if (checkTile && checkTile.getAttribute('data-type') === 'wall') {
// 				stop()
// 				window.alert('Game over')
// 				return [Math.floor(rows.length / 2), Math.floor(columns.length / 2)]
// 			}
// 		}
// 		if (checkTile && checkTile.getAttribute('data-type') === 'loot') {
// 			// stop()
// 			// window.alert('You got the loot')
// 			gotLoot = true
// 			return newCoords
// 		}

// 		return newCoords
// 	})
// 	// if (startPos[0][0] === lootCoords[0] && startPos[0][1] === lootCoords[0]) {
// 	// 	startPos.push(oldCoords[oldCoords.length - 1])
// 	// 	console.log('Loot!', startPos)
// 	// }
// 	if (gotLoot) {
// 		console.log('before loot', JSON.stringify(startPos, null, 2))
// 		console.log(oldCoords.length - 2 || 0)
// 		console.log(oldCoords)
// 		startPos.push(oldCoords[(oldCoords.length - 2) < 0 ? 0 : (oldCoords.length - 2)])
// 		gotLoot = false
// 		console.log('after loot', startPos)
// 	}
// 	makeSnake(startPos)
// 	allowDirectionChange = true
// }

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
	const newCoords = makeNewCoords(startPos[startPos.length - 1])
	startPos.push(newCoords)
	// console.log(startPos)
	const checkTile = document.querySelector(`[data-row="${newCoords[0]}"][data-col="${newCoords[1]}"]`)
	// console.log(checkTile)
	if (allowWalls) {
		if (checkTile && checkTile.getAttribute('data-type') === 'wall') {
			gameOver('wall')
			return [Math.floor(rows.length / 2), Math.floor(columns.length / 2)]
		}
	}
	if (checkTile && checkTile.getAttribute('data-type') === 'snake') {
			gameOver('snake')
			return [Math.floor(rows.length / 2), Math.floor(columns.length / 2)]
		}
	if (startPos[startPos.length - 1][0] === lootCoords[0] && startPos[startPos.length - 1][1] === lootCoords[1]) {
		gotLoot = true
		score++
		document.querySelector('#score').innerHTML = score
		console.log('Loot!', startPos.length)
	}
	if (!gotLoot) {
		startPos.shift(1)
	}
	resetTiles()
	makeSnake(startPos)
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

function gameOver(hit) {
	stop()
	window.alert(hit ? `Game over, you hit the ${hit}` : 'Game over')
}

function updateDirection(key) {
	if (key === 38) { // up arrow
		return direction === down ? down : up
	}	else if (key == 40) { // down arrow
		return direction === up ? up : down
	}	else if (key == 37) { // left arrow
		return direction === right ? right : left
	} else if (key == 39) { // right arrow
		return direction === left ? left : right
	}
}

function handleKeyboard(e) {
	if (e.keyCode === 27) {
		gameOver()
	}
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
