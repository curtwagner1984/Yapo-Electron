var api_key = "04308f6d1c14608e9f373b84ad0e4e4c";
var rp = require('request-promise');
var request = require('request');
var co = require('co');

const modelsSeq = require('../db/sqlite/models/All.js');
var fileImport = require('../files/file-import.js');
const util = require('util');
var _ = require('lodash');
var path = require('path');
const log = require('../util/log.js');
const auxFunc = require('../util/auxFunctions.js');
const fileOp = require('../files/file-operations.js');
const imageOp = require('../files/image-operations.js');

var imageConf = {base_url: "", secure_base_url: ""};

var getConfiguration = co.wrap(function*() {

    // https://api.themoviedb.org/3/configuration?api_key=04308f6d1c14608e9f373b84ad0e4e4c
    var searchString = util.format("https://api.themoviedb.org/3/configuration?api_key=%s", api_key);
    var queryRes = yield rp(searchString);
    queryRes = JSON.parse(queryRes);

    imageConf.base_url = queryRes.images.base_url;
    imageConf.secure_base_url = queryRes.images.secure_base_url;


});

var findActorInfo = co.wrap(function*(actorModel) {

        // https://api.themoviedb.org/3/search/person?api_key=04308f6d1c14608e9f373b84ad0e4e4c&query=isis%20love&include_adult=true

        var searchString = util.format("https://api.themoviedb.org/3/search/person?api_key=%s&query=%s&include_adult=true", api_key, actorModel.name);

        var queryRes = yield rp(searchString);
        queryRes = JSON.parse(queryRes);

        var actorId = null;
        var found = false;
        if (queryRes.total_results > 0) {
            if (!actorModel.is_mainstream) {

                for (let i = 0; i < queryRes.results.length && !found; i++) {

                    if (queryRes.results[i].adult == true) {
                        console.log("Actor id is" + queryRes.results[i].id);
                        actorId = queryRes.results[i].id;
                        found = true;
                    }
                }

            } else {
                //If mainstream choose first result
                actorId = queryRes.results[0].id;
                found = true;
            }

        }

        //https://api.themoviedb.org/3/person/143071?api_key=04308f6d1c14608e9f373b84ad0e4e4c


        if (found) {
            searchString = util.format("https://api.themoviedb.org/3/person/%s?api_key=%s", actorId, api_key);
            var queryRes = yield rp(searchString);
            queryRes = JSON.parse(queryRes);


            //    get Alias
            if (queryRes.also_known_as != undefined) {
                for (let i = 0; i < queryRes.also_known_as.length; i++) {
                    // if (actorModel.actor_alias == undefined) {
                    //     actorModel.actor_alias = [];
                    // }

                    try{

                        var newAlias = yield modelsSeq.ActorAlias.create({
                            name: queryRes.also_known_as[i].trim()
                        });

                        yield actorModel.addAlias(newAlias);
                        log.log(4, util.format("Added Alias: '%s' to actor '%s'", queryRes.also_known_as[i], actorModel.name), 'colorWarn')

                    }catch (e){
                        console.error("Error while trying to add alias '%s' to actor '%s' Error:%s",queryRes.also_known_as[i], actorModel.name, e)
                    }
                    

                    // // if (!(_.includes(actorModel.actor_alias, queryRes.also_known_as[i]))) {
                    // if (!(_.some(actorModel.actor_alias, ['name', queryRes.also_known_as[i]]))){
                    //     actorModel.actor_alias.push({
                    //         name: queryRes.also_known_as[i],
                    //         is_exempt_from_one_word_search: false
                    //     });


                }
            }
            //get bigoraphy
            if (queryRes.biography != undefined) {
                if (actorModel.description == null) {
                    actorModel.description = "";
                }
                if (actorModel.description.indexOf(queryRes.biography) == -1) {
                    actorModel.description = actorModel.description + queryRes.biography;
                    log.log(4, util.format("Added description to actor '%s'", actorModel.description, actorModel.name), 'colorWarn')
                }
            }

            // get birthday
            if (queryRes.birthday != undefined) {
                if (actorModel.date_of_birth == null) {
                    var dateInTmdb = queryRes.birthday;
                    if (dateInTmdb != "") {

                        actorModel.date_of_birth = new Date(dateInTmdb);
                        log.log(4, util.format("Added birthday '%s' to actor '%s'", actorModel.date_of_birth, actorModel.name), 'colorWarn')
                    }

                }
            }

            //    get gender
            if (queryRes.gender != null) {
                if (queryRes.gender == 1) {
                    actorModel.gender = "Female";
                    log.log(4, util.format("Added gender '%s' to actor '%s'", actorModel.gender, actorModel.name), 'colorWarn')
                }


                if (queryRes.gender == 2) {
                    actorModel.gender = "Male";
                    log.log(4, util.format("Added gender '%s' to actor '%s'", actorModel.gender, actorModel.name), 'colorWarn')
                }

            }

            //    get offical pages

            if (queryRes.homepage != undefined && queryRes.homepage != "" ) {
                // if (actorModel.official_pages == undefined) {
                //     actorModel.official_pages = [];
                // }
                
                if (actorModel.official_pages == null || actorModel.official_pages.indexOf(queryRes) == -1 ){
                    actorModel.official_pages = actorModel.official_pages + "," + queryRes.homepage;
                }
            
                
            
            }

            //    get TMdB id
            if (actorModel.tmdb_id == undefined) {
                actorModel.tmdb_id = queryRes.id.toString();


            }

            //    get IMDB id

            if (queryRes.imdb_id != undefined) {
                if (actorModel.imdb_id == undefined) {
                    actorModel.imdb_id = queryRes.imdb_id;
                }

            }
            // get place of birth
            if (queryRes.place_of_birth != undefined) {
                if (actorModel.country_of_origin == undefined) {
                    actorModel.country_of_origin = queryRes.place_of_birth;
                    log.log(4, util.format("Added Place of birth '%s' to actor '%s'", actorModel.country_of_origin, actorModel.name), 'colorWarn')
                }
            }

            //    get profile image
            if (queryRes.profile_path != undefined) {
                if (actorModel.thumbnail == undefined) {
                    if (imageConf.base_url == "") {
                        yield getConfiguration();
                    }

                    var imageUrl = imageConf.base_url + "original" + queryRes.profile_path;

                    var dirToCreatePath = path.join(auxFunc.appRootDir, 'media', 'actors', actorModel.id.toString(), 'profile');
                    var saveFilename = path.join(dirToCreatePath, 'profile.jpg');

                    try {
                        yield fileOp.createFoldersForPath(dirToCreatePath);
                        yield fileOp.download(imageUrl, saveFilename);
                        actorModel.thumbnail = saveFilename;
                        yield imageOp.resizeImage(actorModel.thumbnail, 256);
                        yield imageOp.resizeImage(actorModel.thumbnail, 64);
                    } catch (e) {
                        console.error(e);
                    }


                }
            }
            actorModel.date_last_lookup = new Date();
            yield actorModel.save();
            log.log(4, util.format("Saved actor model for actor '%s'", actorModel.name))


        } else {
            actorModel.date_last_lookup = new Date();
            yield actorModel.save();
            log.log(4, util.format("Actor '%s' wasn't found in TMdB, updated last lookup date..", actorModel.name, actorModel.date_last_lookup))
        }

        return Promise.resolve(actorModel);

    })
    ;


module.exports.findActorInfo = findActorInfo;