var views = sp.require("sp://import/scripts/api/views");
var models = sp.require("sp://import/scripts/api/models");
var ui = sp.require("sp://import/scripts/ui");

var player = models.player;
var library = models.library;
var application = models.application;

var images = new Array();
var currentTimeouts = new Array();
var total = 100;

function initialize() {
	setupBoxes();

	getNextImageSet();
	
	player.observe(models.EVENT.CHANGE, trackChanged);
	
	$(window).resize(function() {
		for (var i = 0; i < currentTimeouts.length; i++) {
			clearTimeout(currentTimeouts[i]);
		}
		
		$("#container").fadeOut("slow", function() {
			$("#container").empty();
			setupBoxes();
			$("#container").fadeIn(3000);
			processImages();
		});
		
	});
}

function setupBoxes() {
	var rows = Math.floor($("html").height() / 126);
	var cols = Math.floor($("html").width() / 126);
	
	var extraHeight = ($("html").height() % 126) / rows;
	var extraWidth = ($("html").width() % 126) / cols;
	
	total = rows * cols;

	for (var y = 0; y < rows; y++) {
		for (var x = 0; x < cols; x++) {
			var div = $("<div></div>").attr("id", "box-" + (x + (y * cols))).addClass("box");
			div.css("height", 126 + extraHeight).css("width", 126 + extraWidth);
			div.css("left", (x * (126 + extraWidth)));
			div.css("top", (y * (126 + extraHeight)));
			
			$("#container").append(div);
		}
	}
	
	currentTimeouts = new Array(total);
}


function getNextImageSet() {
	if (!player.track)
		return;
	var artist = player.track.data.artists[0].name;
	
	lastfm.makeRequest("artist.getImages", {artist: artist, limit: 100, autocorrect: 1}, function(data) {
		img = data.images.image;
		$.each(img, function(index, image) {
			if (image.sizes.size[2]["#text"].indexOf(".gif") > -1) {
				console.log("Yuck, gif");
			} else {
				images.push(image.sizes.size[2]);
			}
		});
		
		var additional = data.images["@attr"].totalPages - 1;
		
		for (var i = 0; i < additional; i++) {
			lastfm.makeRequest("artist.getImages", {artist: artist, limit: 100, page: i+2, autocorrect: 1}, function(data) {
				img = data.images.image;
				$.each(img, function(index, image) {
					images.push(image.sizes.size[2]);
				});
			});
		}
		
		processImages();
	});
}

function trackChanged(event) {
	if (event.data.curtrack) {
		for (var i = 0; i < currentTimeouts.length; i++) {
			clearTimeout(currentTimeouts[i]);
		}
		
		currentTimeouts = new Array();		
		images = new Array();
		
		getNextImageSet();
	}
}

function processImages() {
	for (var i = 0; i < total; i++) {		
		var src = images[i % images.length];
		var index = i;
		if ($("#box-" + index).find("img").length == 0) {
			var image = $("<img></img>").attr("src", src["#text"]).hide();
			$("#box-" + index).append(image);
		}
		preloadImage(src["#text"], {index: i}, function(params, img) {
			$("#box-" + params.index).find("img").fadeOut("slow", function() {
				$("#box-" + params.index).find("img").attr("src", img.src).fadeIn(1500);
			});
			
			currentTimeouts[params.index] = setTimeout(function() { changeImage(params.index, 1); }, Math.floor(Math.random() * (player.track.duration / 1.5)));
		});
	}
}

function changeImage(index, times) {
	var src = images[(index + (total * times)) % images.length];
	preloadImage(src["#text"], {index: index, times: times}, function(params, img) {
		$("#box-" + params.index).find("img").fadeOut("slow", function() {
			$("#box-" + params.index).find("img").attr("src", img.src).fadeIn(1500);
		});
		
		clearTimeout(currentTimeouts[index]);
		currentTimeouts[index] = setTimeout(function() { changeImage(params.index, params.times + 1); }, Math.floor(Math.random() * (player.track.duration / 3)));
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