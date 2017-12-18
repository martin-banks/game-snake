/* eslint-env node */
/* eslint no-console: 0 */

// require modules
const FS = require('fs')
const MKDIRP = require('mkdirp')
const path = require('path')
const HTMLWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const colors = require('colors')


// require local files
// const config = require('./src/config.json')
// const { projectName } = config

const ENV = process.env.NODE_ENV

// helper functions
const DD = num => (`0${num}`).slice(-2) // convert number to double digits
const logEnv = () => {
	if (ENV === 'HOT') {
		return `${'\ue0b0'.bgRed.white}${' HOT '.bgRed}${'\ue0b0'.bgWhite.red}`
	} else if (ENV === 'UAT') {
		return `${'\ue0b0'.bgYellow.white}${' UAT '.bgYellow.black}${'\ue0b0'.bgWhite.yellow}`
	} else if (ENV === 'PROD') {
		return `${'\ue0b0'.bgGreen.white}${' PROD '.bgGreen}${'\ue0b0'.bgWhite.green}`
	}
	return 'No ENV detected'.bgRed
}
console.log(`Building for ${logEnv()}`)
// set up our variables
// const publicPath = require(`./src/publicPath-${ENV}`)



const buildDir = `./_BUILD/${ENV}`
const buildPath = path.join(__dirname, buildDir)
// const embedPath = `./_BUILD/${ENV}`

const jsName = ENV === 'PROD' ? 'app.min.js' : 'app.js'
const cssName = ENV === 'PROD' ? 'app.min.css' : 'app.css'



// Start build our output
// HOT is a live reloading env that does not need file output
// this is skipped unless in UAT or PROD env
if (ENV && ENV !== 'HOT') {
	// create our file directory if it does not exist
	MKDIRP(buildDir, err => {
		if (err) return console.log(colors.bgRed(err))
		console.log(colors.bgWhite.black(`\n\n${colors.bgGreen(' Project directory').black}${colors.bgWhite('\ue0b0').green} created successfully ${colors.bgBlack('\ue0b0').white}`))
  })
}


// Weboack needs an output destination;  this changes depending on the env we are building
// we generate it here and reference to kepp the config cleaner
const output = ENV === 'HOT' ? {
	filename: jsName,
	path: buildPath,
} : {
	filename: jsName,
	path: buildPath,
	publicPath: buildPath,
}

module.exports = {
	// where does it start?
	entry: path.join(__dirname, '/src/app.js'),
	// where does it go to
	output,
	resolve: {
		extensions: ['.js', '.css'],
	},
	module: {
		// what it should test for and process
		rules: [
			// All .js files, nodemodules are handled through imports so we want to skip them
			// es6 still needs to be transpiled for cross-browser compatibilty, babel-loader 
			// handles this for us
			// js minification is called from the command initaiting this process in package.json
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: 'babel-loader',
			},
			// style sheets. 
			// any css, sass, scss will be processed into css
			// only use one per project to avoid confusion
			{
				test: /\.css$|.sass$|.scss$/,
				use: ExtractTextPlugin.extract({ // used to create a new file an dnot inline into the html output
					fallback: 'style-loader',
					use: [
						{
							loader: 'css-loader',
							options: {
								// if css modiles are not used, this must be set to false or no styles will be processed
								modules: true,
								// specify our naming convention, this will out put
								// filename__selectorName__5characterRandomString
								localIdentName: '[name]__[local]___[hash:base64:5]',
								// only minimize in prod to improve readability while in dev
								minimize: ENV === 'PROD',
								importLoaders: 1,
							},
						},
						// apply post css-rules; this improves browser compatability by add prefixes etc
						{ loader: 'postcss-loader' },
						// convert sass to css
						{ loader: 'sass-loader' },
					],
				}),
			},
			// Images are also supported as imports. this removes requirement to know absolute file paths of published images
			{
				test: /\.(jpe?g|png|gif|svg)$/i,
				// unique name generated to prevent naming confilcts of images from multiple sources (eg, portrait/landscape dirs)
				use: 'file-loader?hash=sha512&digest=hex&name=[path][name]__[hash:6].[ext]',
			},
		],
	},

	plugins: [
		// create html file
		// this creates a index.html doc with all project files added. 
		new HTMLWebpackPlugin({
			title: 'Snake',
			template: path.join(__dirname, '/src/index.html'),
			filename: 'index.html',
			inject: 'body',
		}),
		// setup extract css into it's own file, not inline in html
		new ExtractTextPlugin({
			filename: cssName,
			allChunks: true,
		}),
	],

}
