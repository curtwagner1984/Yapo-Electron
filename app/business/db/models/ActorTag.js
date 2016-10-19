var thinky = require('../util/thinky.js');
var type = thinky.type;

var ActorTag = thinky.createModel("ActorTag", {

    name:type.string().required(),
    thumbnail:type.string(),
    actor_tag_alias:type.string(),

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

module.exports = ActorTag;

var Actor = require(__dirname+ '/Actor.js');
var Scene = require(__dirname+ '/Scene.js');
var Picture = require(__dirname+ '/Picture.js');

ActorTag.hasAndBelongsToMany(Actor, "actors", "id", "id");
ActorTag.hasAndBelongsToMany(Scene, "scenes", "id", "id");
ActorTag.hasAndBelongsToMany(Picture, "pictures", "id", "id");

