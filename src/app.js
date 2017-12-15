const app = document.querySelector('#app')
const rows = Array.from(new Array(100))
const columns = Array.from(new Array(100))

const template = (ri, ci) => `<div 
	data-type="tile"
	data-row=${ri}
	data-col=${ci}
	style="
		transform: translate(${ci * 1}vw, ${ri * 1}vh)
	"
></div>`

const tiles = rows
	.map((r, ri) => columns.map((c, ci) => template(ri, ci)).join(''))
	.join('')

const interval = 100
let startPos = [[50, 50]]
const direction = [0, 1]
let gameLoop = null


function makeSnake(coords) {
	coords
		.map(s => document.querySelector(`[data-row="${s[0]}"][data-col="${s[1]}"]`))
		.forEach(s => s.setAttribute('type', 'snake'))
}

function resetTiles() {
	const allSnakeTiles = document.querySelectorAll('[data-type=snake]')
	allSnakeTiles.forEach(t => t.setAttribute('type', 'tile'))
}


function startGame() {
	app.innerHTML = tiles
	makeSnake()
	console.log({gameLoop})
	gameLoop = setInterval(() => {
		resetTiles()
		const newCoords = startPos.map(p => {
			const newRow = p[0] + direction[0]
			const newCol = p[1] + direction[1]
			return [
				((newRow > 0) && (newRow < rows.length)) ? newRow : 0,
				((newCol > 0) && (newCol < columns.length)) ? newCol : 0,
			]
		})
		makeSnake(newCoords)

	}, interval)
	console.log({gameLoop})
	return 'game started'
}

function stopGame() {
	console.log({gameLoop})
	clearInterval(gameLoop)
	return 'game stopped'
	console.log({gameLoop})
}

