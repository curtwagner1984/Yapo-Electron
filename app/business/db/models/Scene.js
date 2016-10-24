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
    last_filename_tag_lookup: type.date()


});

module.exports = Scene;


var Tag = require(__dirname + '/Tag.js');
var Website = require(__dirname + '/Website.js');
var Actor = require(__dirname + '/Actor.js');
var TreeFolder = require(__dirname + '/TreeFolder.js');


Scene.hasAndBelongsToMany(Actor, "actors", "id", "id");
Scene.hasAndBelongsToMany(Tag, "tags", "id", "id");
Scene.hasAndBelongsToMany(Website, "websites", "id", "id");


Scene.belongsTo(TreeFolder, "folder", "folderId", "id");
