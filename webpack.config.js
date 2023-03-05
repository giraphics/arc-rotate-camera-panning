const path = require('path');
module.exports = {
	mode: 'development',
	entry: [
		'./index.ts',
	],
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: [ 'ts-loader' ],
				exclude: /node_modules/,
			}
		],
	},
	devServer: {
		contentBase: path.resolve(__dirname, './assets'),
	},
	resolve: {
		extensions: ['.ts', '.js'],
	},
};
