var thinky = require('../util/thinky.js');
var type = thinky.type;

var Scene = thinky.createModel("Scene", {

    name: type.string().required(),
    path_to_file: type.string().required(),
    path_to_dir: type.string(),
    thumbnail: type.string(),
    description: type.string(),
    codec_name: type.string(),

    rating: type.number().integer(),
    play_count: type.number().integer(),
    width: type.number().integer(),
    height: type.number().integer(),
    bit_rate: type.number().integer(),
    duration: type.number().integer(),
    size: type.number().integer(),
    framerate: type.number(),

    is_fav: type.boolean().default(false),
    is_runner_up: type.boolean().default(false),


    date_added: type.date().default(function () {
        return new Date();
    }),
    date_fav: type.date(),
    date_runner_up: type.date(),
    date_last_played: type.date(),
    date_last_lookup:type.date(),

    actors: [
        {
            name: type.string(),
            id: type.string()
        }
    ]

    

});

Scene.ensureIndex("path_to_file");
Scene.ensureIndex("name");
Scene.ensureIndex("date_added");
Scene.ensureIndex("size");

Scene.ensureIndex('actorsName',function (row) {
    return row('actors').map(function (actor) {
        return actor('name')
    })
}, {multi: true});

Scene.ensureIndex('actorsId',function (row) {
    return row('actors').map(function (actor) {
        return actor('id')
    })
}, {multi: true});





module.exports = Scene;


// var Tag = require(__dirname + '/Tag.js');
// var Website = require(__dirname + '/Website.js');
// var Actor = require(__dirname + '/Actor.js');
var TreeFolder = require(__dirname + '/TreeFolder.js');


// Scene.hasAndBelongsToMany(Actor, "actors", "id", "id");
// Scene.hasAndBelongsToMany(Tag, "tags", "id", "id");
// Scene.hasAndBelongsToMany(Website, "websites", "id", "id");


Scene.belongsTo(TreeFolder, "folder", "folderId", "id");
