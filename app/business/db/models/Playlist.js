var thinky = require('../util/thinky.js');
var type = thinky.type;

var Playlist = thinky.createModel("Playlist", {

    name: type.string().required(),
    description: type.string(),


    rating: type.number().integer(),
    play_count: type.number().integer(),

    is_fav: type.boolean().default(false),
    is_runner_up:type.boolean().default(false),


    date_added:type.date().default(function () {
        return new Date();
    }),
    date_fav:type.date(),
    date_runner_up:type.date()





});

module.exports = Playlist;

var Scene = require(__dirname+ '/Scene.js');

Playlist.hasAndBelongsToMany(Scene, "scenes", "id", "id");
