function createArray(length) {
    var arr = new Array(length || 0),
        i = length;

    if (arguments.length > 1) {
        var args = Array.prototype.slice.call(arguments, 1);
        while(i--) arr[length-1 - i] = createArray.apply(this, args);
    }

    return arr;
}

function count(s, subs) {
	var count_array = s.split(subs);
	return (count_array.length - 1);
}

function getColor(count) {
	if(count < 3) {
		return 'black';
	}
	else if (count < 10) {
		return 'pink';
	}
	else if (count < 20) {
		return '#66023C';
	}
	else if (count < 30) {
		return 'white';
	}
	else {
		return '#007FFF';
	}
}

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function createColorArray() {
	colors = createArray(5);
	for(i = 0; i < 5; i++) {
		colors[i] = getRandomColor();
	}
	return colors;
}

function getRandom(count, colors) {
	if(count < 3) {
		return colors[0];
	}
	else if(count < 10) {
		return colors[1];
	}
	else if(count < 20) {
		return colors[2];
	}
	else if(count < 30) {
		return colors[3];
	}
	else {
		return colors[5];
	}
}

function createMatrix(lyrics) {
	console.log('creating lyrics self-similarity matrix');
	lyrics = lyrics.replace(/(Paroles de la chanson | par)/, '');
	var lyr = lyrics.replace(/\n/g, ' ');
	lyr = lyr.replace(/[^\d\w\s]/g, '');
	lyr = lyr.toLowerCase();
	words = lyr.split(' ');
	var length = words.length;
	count_array = createArray(length);
	for(i = 0; i < length; i++) {
		count_array[i] = count(lyr, words[i]);
	}
	console.log(count_array);
	matrix = createArray(length, length);
	for(i = 0; i < length; i++) {
		for(j = 0; j < length; j++) {
			if (words[i] == words[j]) {
				matrix[i][j] = count_array[i];
			}
		}
	}
	return matrix;
	
} 

function drawMatrix(matrix, style) {
	console.log('drawing matrix onto canvas');
	var canvas = document.getElementById('canvas');
	var ctx = canvas.getContext('2d');
	var c = canvas.width;
	canvas.width = c;
	canvas.height = c;
	ctx.fillStyle = 'grey';
	ctx.fillRect(0,0,c,c);
	var length = matrix[0].length;
	var width = c/length;
	var colors;
	ctx.fillStyle = 'black';
	for(i = 0; i < length; i++) {
		for(j = 0; j < length; j++) {
			if(matrix[i][j] > 0) {
				x_pos = i*width;	
				y_pos = j*width;
				if(style == "color") {
					ctx.fillStyle = getColor(matrix[i][j]);
				}
				else if(style == "random") {
					if(i == 0 && j == 0) colors = createColorArray();
					ctx.fillStyle = getRandom(matrix[i][j], colors);
				}
				ctx.fillRect(x_pos, y_pos, width, width);
			}
		}
	}
}

angular.module('myApp', [])
       .controller('myCtrl', ['$scope', '$http', '$sce', myCtrl]);


function myCtrl($scope, $http, $sce) {
	$scope.suggestions = [];
        $scope.lyricsSearch = 0;
	$scope.hide = true;
	$scope.style = "black";
	$scope.getSuggestions = function() {
		if($scope.songTitle == '') {
			$scope.suggestions = [];
			return;
		}
		var url = 'https://api.musixmatch.com/ws/1.1/track.search?format=jsonp&q_track_artist='
		url += $scope.songTitle;
		url += '&quorum_factor=1&apikey=f918b37c7aed33455d41b6499b2bae51&s_track_rating=desc&f_has_lyrics=1&s_artist_rating=desc';
		var trustedUrl = $sce.trustAsResourceUrl(url);
		$http.jsonp(trustedUrl, {jsonCallbackParam: 'callback'})
		 .then(function onSuccess(response) {
			  var data = response.data['message']['body']['track_list'];
			  $scope.suggestions = data;
		});
	}
	$scope.searchSong = function(){    
		$scope.songTitle = '';
		$scope.suggestions = [];
		var url = 'https://api.lyrics.ovh/v1/' + $scope.lyricsSearch;
		$http.get(url)
		     .then(function onSuccess(response) {
				$scope.lyricsSearch = 0;
				var data = response.data;
				console.log(data.lyrics);
				$scope.matrix = createMatrix(data.lyrics);
				drawMatrix($scope.matrix, $scope.style);
				$scope.track  = {
					artist: ($scope.artist + '--  '),
					track_name: $scope.track_name,
					lyrics: data.lyrics
				};
				$scope.hide = false;
		     }, function myError(response) {
			  $scope.track = {
				artist: "Sorry, could not get Lyrics",
				track_name: "please try another song",
				lyrics: ""
				 };
				 $scope.hide = true;
			});
	}
	$scope.onClick = function(track){
		$scope.artist = track.track.artist_name;
		$scope.track_name = track.track.track_name;
		$scope.songTitle = $scope.artist + ": " + $scope.track_name;
		var main_artist = $scope.artist;
		var index = main_artist.indexOf(' feat. ');
		if(index > -1) {
			main_artist = main_artist.substring(0, index);
		}
		$scope.lyricsSearch = main_artist + "/" + $scope.track_name;
		console.log($scope.lyricsSearch);
		$scope.suggestions = [];
		$scope.searchSong();
	}
	$scope.makeBlack = function(){
		$scope.style="black";
		drawMatrix($scope.matrix, $scope.style);
	}
	$scope.makeColor = function() {
		$scope.style = "color";
		drawMatrix($scope.matrix, $scope.style);
	}
	$scope.makeRandom = function() {
		$scope.style = "random";
		drawMatrix($scope.matrix, $scope.style);
	}
}

