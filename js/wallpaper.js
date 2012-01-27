var views = sp.require("sp://import/scripts/api/views");
var models = sp.require("sp://import/scripts/api/models");
var ui = sp.require("sp://import/scripts/ui");

var player = models.player;
var library = models.library;
var application = models.application;

var images = null;

var boxHeight = $(document).height() / 3.0;
var boxWidth = $("#box-1").width();

function initialize() {
	$(".row").height($(document).height() / 3.0);
	
	getNextImageSet();
}

function getNextImageSet() {
	var artist = player.track.data.artists[0].name;
	
	lastfm.makeRequest("artist.getImages", {artist: artist}, function(data) {
		images = data.images.image;
		for (var i = 0; i < 10; i++) {
			var rand = Math.floor(Math.random() * images.length);
			var size = images[rand].sizes.size[5];
			height = size.height;
			width = size.width;
			
			var image = $("<img></img>").attr("src", size["#text"]);
			preloadImage(size["#text"], {index: i, height: height, width: width}, function(params, img) {
				console.log("Loaded " + params.index, $(img));

				if (params.height > params.width) {
					console.log("height > width " + "H: " + Math.round(height * boxWidth / params.width) + " W: " + boxWidth + " " + params.index);
					$(img).width(boxWidth);
					$(img).height(Math.round(params.height * boxWidth / params.width));
					
					if ($(img).height() > boxHeight) {
						diff = $(img).height() - boxHeight;
						$(img).css("margin-top", -1 * (diff * 0.3));
					}
					
				} else {
					console.log("width > height " + "H: " + boxHeight + " W: " + Math.round(width * boxHeight / params.height) + " " + params.index);
					$(img).width(Math.round(params.width * boxHeight / params.height));
					$(img).height(boxHeight);
				}
				
				$("#box-" + params.index).append(img);
			});
		}
	});
}

function preloadImage(imgSrc, params, callback) {
	var objImagePreloader = new Image();

	objImagePreloader.src = imgSrc;
	if (objImagePreloader.complete) {
		callback(params, objImagePreloader);
		objImagePreloader.onload = function() { };
	} else {
		objImagePreloader.onload = function() {
			callback(params, objImagePreloader);
			// clear onLoad, IE behaves irratically with animated gifs otherwise
			objImagePreloader.onload = function() { };
		}
	}
}