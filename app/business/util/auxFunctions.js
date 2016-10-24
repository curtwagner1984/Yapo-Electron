var path = require('path');
var models = require('../db/models/all.js');
var appRootDir = path.join(__dirname, '..', '..');
var util = require('util');
var log = require('../util/log.js');
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


var addTagToScene = function (scene, tagType, tagTypeInSceneObject, tagToAddName, mediaType) {

    return new Promise(function (resolve, reject) {

        models[tagType].filter({name: tagToAddName}).run().then(function (res) {
            var tagToAdd = null;
            if (res.length == 0) {
                tagToAdd = new models[tagType]({
                    name: tagToAddName

                });
            } else {
                tagToAdd = res[0];


            }
            
            if (mediaType == 'Video'){
                mediaType = 'Scene';
            }

            if (scene[tagTypeInSceneObject] == undefined) {
                models[mediaType].get(scene.id).getJoin({
                    actors: true,
                    scene_tags: true,
                    actor_tags: true,
                    websites: true
                }).then(function (joinedScene) {

                    var found = false;
                    for (let i = 0; i < joinedScene[tagTypeInSceneObject].length && !found; i++) {
                        if (joinedScene[tagTypeInSceneObject][i].name == tagToAdd.name) {
                            found = true;
                        }
                    }
                    if (!found) {


                        joinedScene[tagTypeInSceneObject].push(tagToAdd);

                        joinedScene.saveAll().then(function (scene) {
                            log.log(3,util.format("Saved %s - '%s' to '%s'", tagType, tagToAdd.name, scene.name),'colorWarn');
                            resolve(scene);
                        })


                    } else {
                        log.log(4,util.format("%s - '%s' Already exists in '%s'", tagType, tagToAdd.name, scene.name),'colorWarn');
                        resolve(scene);
                    }
                    
                });
                
            }

            


        });

    });


};


module.exports.appRootDir = appRootDir;
module.exports.timeSecondsToHHMMSS = timeSecondsToHHMMSS;
module.exports.timeHHMMSSstringToSeconds = timeHHMMSSstringToSeconds;
module.exports.padQuotes = padQuotes;
module.exports.addTagToScene = addTagToScene;
