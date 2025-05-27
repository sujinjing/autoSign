const fetch = require('node-fetch')
const requestFetch = function (url, options) {
	return fetch(url, options).then(res => res.json())
}


// exports.requestFetch = requestFetch;
module.exports = requestFetch
