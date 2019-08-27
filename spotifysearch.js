
var Spotify = require('node-spotify-api');
var Search = function(song) {
    this.song = song;
    this.search = function() {
        spotify.search({ type: 'track', query: song }, function (err, data) {
            if (err) {
                return console.log('Error occurred: ' + err);
            }
    
            for (i = 0; i < data.tracks.items.length; i++) {
                console.log("Album name is " + data.tracks.items[i].album.name);
                console.log("Release date is " + data.tracks.items[i].album.release_date);
                console.log("Preview link is " + data.tracks.items[i].preview_url);
                for (j = 0; j < data.tracks.items[i].album.artists.length; j++) {
                    console.log("Artist name is " + data.tracks.items[i].album.artists[j].name);
                    console.log("*****************************************");
                }
                console.log("*****************************************");
    
            }
            // console.log("let us see is this works");
    
        });
      };
      search(song);
    
  };
  
module.exports = Spotify;