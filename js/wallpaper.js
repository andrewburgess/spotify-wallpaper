var views = sp.require("sp://import/scripts/api/views");
var models = sp.require("sp://import/scripts/api/models");
var ui = sp.require("sp://import/scripts/ui");

var player = models.player;
var library = models.library;
var application = models.application;

var images = new Array();

function initialize() {
	$(".row").height($(document).height() / 3.0);

	lastfm.makeRequest("artist.getImages", {artist: "Cher"}, function(data) {
		var size = data.images.image[0].sizes.size[0];
		var image = $("<img></img>").attr("src", size["#text"]);
		height = size.height;
		width = size.width;
		console.log(height + " " + width);
		$("#box-3").append(image);
	});
}