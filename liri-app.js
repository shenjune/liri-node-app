// Import API keys as environmental variables from .env file 
require("dotenv").config();
const keys = require("./keys.js");

// Import other packages
const axios = require('axios')
const moment = require('moment');
const chalk = require('chalk');
const fs = require('fs');

// Import spotify api
var Spotify = require('node-spotify-api');
var spotify = new Spotify(keys.spotify);

/* 
App commands TODO:
-concert-this
-spotify-this-song
-movie-this
-do-what-it-says
*/

// Define User Request
const opperand = process.argv[2];
const argument = process.argv.slice(3).join(' ');

// Output info to log file
function logThis(text) {
    fs.appendFile('log.txt', text + '\n', 'utf8', (err) => {
        if (err) throw err;
    });
};

// Initalize log file session
logThis(`\n------------------------------------------------------------------\nExecution of user request: ${opperand} : ${argument}\nLog begins at ${moment().format('YYYY-MM-DD h:mm:ss a')}`);

//Concert This
function concertThis(artist) {
    let requestURL = "https://rest.bandsintown.com/artists/" + artist + "/events?app_id=codingbootcamp";

    // Asynchronous AJAX request
    axios
        .get(requestURL)
        .then((bigResponse) => {
            let response = bigResponse.data
            console.log(`Upcomming concerts from ${argument}:`);
            logThis(`>>Upcomming concerts from ${argument}:`)

            if (!response[0]) {
                logThis('>>No concerts found.');
                console.log(chalk.gray('No concerts found.'));
            }
            else {
                for (let i = 0; i < response.length; i++) {
                    let date = moment(response[i].datetime);
                    let venue = response[i].venue.name;
                    let location = response[i].venue.city + ', ' + response[i].venue.region;
                    // let lineup = response[i].lineup

                    logThis(`>>${date.format("dddd, MMMM Do YYYY")}` + ` at ` + `${venue}` + ` in ` + `${location}`)

                    console.log(chalk.whiteBright(`${date.format("dddd, MMMM Do YYYY")}`) + ` at ` + chalk.magentaBright.bold(`${venue}`) + ` in ` + chalk.cyan(`${location}`));

                }
            }
        })
        .catch((err) => {
            logThis(`Encountered the following error: ${err.stack}`);
            logThis('>>No concerts found.');
            console.log(chalk.gray('No concerts found.'));
        })

};

// Spotify this
function spotifyThisSong(song) {
    if (!song || song == '') { song = 'The Sign, Ace of Base' }
    spotify.search({ type: 'track', query: song }, function (err, data) {
        if (err) {
            logThis(`Encountered the following error: ${err.stack}`);
        }

        if (!data.tracks.items[0]) {
            logThis(`>>No song called '${song}' could be found.`);
            console.log(chalk`{red No song called {cyan ${song}} could be found.}`);
        }
        else {
            let artist = data.tracks.items[0].artists[0].name;
            let songName = data.tracks.items[0].name;
            let preview = data.tracks.items[0].preview_url;
            let album = data.tracks.items[0].album.name;

            if (!preview) { preview = 'Preview Not Available' }

            logThis(">>'" + songName + "'" + ' by ' + "'" + artist + "'" + '\n>>' + 'From the album ' + "'" + album + "'" + '\n>>' + 'Click here for a preview: ' + preview);

            console.log(chalk.cyan.bold(songName) + ' by ' + chalk.red(artist));
            console.log('From the album ' + chalk.magenta(album));
            console.log('Click here for a preview: ' + chalk.gray(preview));
        }

    })
};

// Movie This
function movieThis(movieName) {

    if (movieName.trim() == '') { movieName = 'Mr. Nobody' };

    let requestURL = "http://www.omdbapi.com/?t=" + movieName + "&type=movie&apikey=trilogy";

    // Asynchronous AJAX request
    axios
        .get(requestURL)
        .then((bigResponse) => {

            response = bigResponse.data

            logThis(`>>Information about ${movieName}:`)
            console.log(chalk`Information about ${movieName}:`)

            if (response.Response === 'False') {
                if (response.Error === 'Movie not found!') {

                    logThis('>>No movie with that title was found.')
                    console.log(chalk`{gray No movie with that title was found.}`)
                } else {
                    logThis('>>Unable to find results.')
                    console.log(chalk`{gray Unable to find results.}`)
                }
            }
            else {

                let title = response.Title;
                let year = response.Year;
                let ratingIMDB;
                let ratingTomates;
                let country = response.Country;
                let lang = response.Language;
                let plot = response.Plot;
                let actors = response.Actors;

                for (let i = 0; i < response.Ratings.length; i++) {
                    switch (response.Ratings[i].Source) {
                        case "Internet Movie Database":
                            ratingIMDB = response.Ratings[i].Value;
                            break;
                        case "Rotten Tomatoes":
                            ratingTomates = response.Ratings[i].Value;
                            break;
                    }
                }

                // Set up conditional chalk formatting for ratings, while preserving original unformatted ratings for the log
                let imdbPass;
                let tomatoesPass;
                if (parseFloat(ratingIMDB) > 5) {
                    if (parseFloat(ratingIMDB) < 7) { imdbPass = chalk`was rated {yellow ${ratingIMDB}}` }
                    else { imdbPass = chalk`was rated {green ${ratingIMDB}}` }
                } else if (ratingIMDB) { imdbPass = chalk`was rated {red ${ratingIMDB}}` }
                else { imdbPass = chalk`was {grey not rated}` }

                if (parseFloat(ratingTomates) > 50) {
                    if (parseFloat(ratingTomates) < 70) { tomatoesPass = chalk`scored {yellow ${ratingTomates}}` }
                    else { tomatoesPass = chalk`scored {green ${ratingTomates}}` }
                } else if (ratingTomates) { tomatoesPass = chalk`scored {red ${ratingTomates}}` }
                else { tomatoesPass = chalk`was {grey not rated}` }


                logThis(`>>${title} was released in ${year}.\n>>It stars ${actors}.\n>>It was made in ${country} and is in ${lang}.\n>>It ${ratingIMDB} on IMDB and ${ratingTomates} on RottenTomatoes.\n>>Here is a brief summary of the plot:\n>>${plot}`);

                console.log(chalk`{cyan.bold ${title}} was released in ${year}.\nIt stars {magenta ${actors}}.\nIt was made in ${country} and is available in ${lang}.\nIt ${imdbPass} on IMDB and ${tomatoesPass} on RottenTomatoes.\nHere is a brief summary of the plot:\n${plot}`);


            }
        })
        .catch((err) => {
            logThis(`Encountered the following error: ${err.stack}`);
            logThis('>>No movie found with that title.');
            console.log(chalk.gray('No movie found with that title.'));
        })
};

// Do what it says
function doWhatItSays() {
    fs.readFile('random.txt', 'utf-8', (err, data) => {
        let lines = data.split('\n');
        for (let i = 0; i < lines.length; i++) {
            let lineParts = lines[i].split(' ');
            mainLoop(lineParts[0], lineParts.slice(1).join(' '));
        }
    })
};

// Main loop
function mainLoop(opp = opperand, arg = argument) {
    switch (opp) {
        case 'concert-this':
            logThis(`Executing command '${opp}' with argument '${arg}'`);
            concertThis(arg);
            break;
        case 'spotify-this-song':
            logThis(`Executing command '${opp}' with argument '${arg}'`);
            spotifyThisSong(arg);
            break;
        case 'movie-this':
            logThis(`Executing command '${opp}' with argument '${arg}'`);
            movieThis(arg);
            break;
        case 'do-what-it-says':
            logThis(`Executing command '${opp}'`);
            doWhatItSays();
            break;
        default:
            if (!opp || opp.trim() === '') {
                logThis('Blank line in random.txt was ignored.')
            } else {
                logThis(`>>Command '${opp}' not recognized.`)
                console.log(chalk`Command {red.bold ${opp}} not recognized.`)
            }
    };
}

mainLoop();