var express = require('express');
var request = require('request');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index.html', { root: 'public' });
});
router.get('/searchsong', function(req, res, next) {
	console.log('in Search Song');
	var lyricsSearch = req.query.q;
	var lyric_url = 'https://api.lyrics.ovh/v1/' + lyricsSearch;
	request(lyric_url).pipe(res);
});	
	

module.exports = router;
