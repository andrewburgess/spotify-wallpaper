sp = getSpotifyApi(1);

exports.makeRequest = makeRequest;

var key = "21edbb30193dc36e6fb21cc57b1d8e18";

function makeRequest(method, args, callback) {
	args.api_key = key;
	args.format = "json";
	args.method = method;
	
	console.log("LASTFM: " + "http://ws.audioscrobbler.com/2.0/", args);
	$.ajax({
		dataType: "jsonp",
		cache: false,
		data: args,
		url: "http://ws.audioscrobbler.com/2.0/",
		success: function (data) {
			console.log("LASTFM: Received data", data);
			if (checkResponse(data)) {
				callback(data);
			} else {
				console.error("LASTFM: makeRequest bailed");
			}
		},
		error: function (jqxhr, textStatus, errorThrown) {
			console.error("LASTFM: Problem making request", jqxhr); 
			console.error(textStatus);
			console.error(errorThrown);
		}		
	});
}

function checkResponse(data) {
	if (data.error) {
		console.error("Error from Last.FM: (" + data.error + ") " + data.message);
		return false;
	} else {
		return true;
	}
}

