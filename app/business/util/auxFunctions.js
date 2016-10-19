var path = require('path');
var models = require('../db/models/all.js');
var appRootDir = path.join(__dirname, '..', '..');
var util = require('util');
console.log("App root dir: " + appRootDir);

var timeSecondsToHHMMSS = function (sec) {

    var hours = Math.floor(sec / 3600);
    var minutes = Math.floor((sec - (hours * 3600)) / 60);
    var seconds = sec - (hours * 3600) - (minutes * 60);

    if (hours < 10) {
        hours = "0" + hours;
    }
    if (minutes < 10) {
        minutes = "0" + minutes;
    }
    if (seconds < 10) {
        seconds = "0" + seconds;
    }
    return hours + ':' + minutes + ':' + seconds;

};


var timeHHMMSSstringToSeconds = function (str) {
    var hms = str.split(':');
    return (+hms[0]) * 60 * 60 + (+hms[1]) * 60 + (+hms[2] || 0);

};

var padQuotes = function (string) {
    return "\"" + string + "\""
};


var addTagToScene = function (scene, tagType, tagTypeInSceneObject, tagToAddName) {

    return new Promise(function (resolve, reject) {

        models[tagType].getJoin({scenes: true, pictures: true}).filter({name: tagToAddName}).run().then(function (res) {
            var tagToAdd = null;
            if (res.length == 0) {
                tagToAdd = new models[tagType]({
                    name: tagToAddName

                });
            } else {
                tagToAdd = res[0];


            }

            if (scene[tagTypeInSceneObject] == undefined) {
                scene[tagTypeInSceneObject] = [];
            }

            var found = false;
            for (let i = 0; i < scene[tagTypeInSceneObject].length && !found; i++) {
                if (scene[tagTypeInSceneObject][i].name == tagToAdd.name) {
                    found = true;
                }
            }
            if (!found) {


                scene[tagTypeInSceneObject].push(tagToAdd);

                scene.saveAll().then(function (scene) {
                    console.log(util.format("Saved %s - '%s' to '%s'", tagType, tagToAdd.name, scene.name));

                    resolve(scene);
                })


            } else {
                console.log(util.format("%s - '%s' Already exists in '%s'", tagType, tagToAdd.name, scene.name));
                resolve(scene);
            }


        });

    });


};


module.exports.appRootDir = appRootDir;
module.exports.timeSecondsToHHMMSS = timeSecondsToHHMMSS;
module.exports.timeHHMMSSstringToSeconds = timeHHMMSSstringToSeconds;
module.exports.padQuotes = padQuotes;
module.exports.addTagToScene = addTagToScene;
