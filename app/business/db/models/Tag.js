var thinky = require('../util/thinky.js');
var type = thinky.type;

var Tag = thinky.createModel("Tag", {

    name:type.string().required(),
    thumbnail:type.string(),
    tag_alias:type.string(),

    is_fav: type.boolean().default(false),
    is_runner_up:type.boolean().default(false),

    rating: type.number().integer(),
    play_count: type.number().integer(),

    date_added:type.date().default(function () {
        return new Date();
    }),
    date_fav:type.date(),
    date_runner_up:type.date()


});

module.exports = Tag;


var Scene = require(__dirname+ '/Scene.js');
var Actor = require(__dirname+ '/Actor.js');
var Picture = require(__dirname+ '/Picture.js');
var Website = require(__dirname+ '/Website.js');


Tag.hasAndBelongsToMany(Scene, "scenes", "id", "id");
Tag.hasAndBelongsToMany(Actor, "actors", "id", "id");
Tag.hasAndBelongsToMany(Picture, "pictures", "id", "id");
Tag.hasAndBelongsToMany(Website, "websites", "id", "id");

