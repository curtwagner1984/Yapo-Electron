var path = require('path');

var appRootDir = path.join(__dirname, '..', '..');
var util = require('util');
var log = require('../util/log.js');

console.log("App root dir: " + appRootDir);

var constants = {
    noActorImagePath: path.join(__dirname, '../../media/unknown/unknown female.jpg'),
    noSceneImagePath: path.join(__dirname, '../../media/unknown/unknown scene.jpg')
};

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


var generateSQLQueryForFilteringIDsFromThroughTable = function (idToSelect, joinTableName, targetColumnName, targetColumnValue) {

    return util.format('(SELECT DISTINCT "%s" FROM "%s" WHERE %s = %s )',idToSelect,joinTableName,targetColumnName,targetColumnValue)

};


var addTagToScene = function (scene, tagType, tagTypeInSceneObject, tagToAddName) {

    return new Promise(function (resolve, reject) {

        models[tagType].filter({name: tagToAddName}).run().then(function (res) {
            var tagToAdd = null;
            var newTag = false;
            if (res.length == 0) {
                newTag = true;
                
                tagToAdd = new models[tagType]({
                    name: tagToAddName

                });
            } else {
                tagToAdd = res[0];
            }

            var found = false;
            for (let i = 0; i < scene[tagTypeInSceneObject].length && !found; i++) {
                if (scene[tagTypeInSceneObject][i].name == tagToAdd.name) {
                    found = true;
                }
            }

            if (!found) {
                scene[tagTypeInSceneObject].push(tagToAdd);
                scene.saveAll().then(function (sc) {
                    log.log(3, util.format("Saved %s - '%s' to '%s'", tagType, tagToAdd.name, sc.name), 'colorWarn');
                    if (newTag && tagType == "Actor"){
                        //The require is here to prevent circular require loop on startup. (tmdbScrap requires auxFunctions and auxFunctions requires tmdbScrap) should find a better solution...
                        var tmdbScrap = require('../scrapers/tmdbScraper.js');

                        tmdbScrap.findActorInfo(tagToAdd);    
                    }
                    
                    
                    resolve(sc);
                })

            } else {
                log.log(4, util.format("%s - '%s' Already exists in '%s'", tagType, tagToAdd.name, scene.name), 'colorWarn');
                resolve(scene);
            }


        });

    });


};


module.exports.appRootDir = appRootDir;
module.exports.constants = constants;
module.exports.timeSecondsToHHMMSS = timeSecondsToHHMMSS;
module.exports.timeHHMMSSstringToSeconds = timeHHMMSSstringToSeconds;
module.exports.padQuotes = padQuotes;
module.exports.addTagToScene = addTagToScene;
module.exports.generateSQLQueryForFilteringIDsFromThroughTable = generateSQLQueryForFilteringIDsFromThroughTable;
