var thinky = require('../util/thinky.js');
var type = thinky.type;

var SceneTag = thinky.createModel("SceneTag", {

    name:type.string().required(),
    thumbnail:type.string(),
    scene_tag_alias:type.string(),

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

module.exports = SceneTag;


var Scene = require(__dirname+ '/Scene.js');

SceneTag.hasAndBelongsToMany(Scene, "scenes", "id", "id");

