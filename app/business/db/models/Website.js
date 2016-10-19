var thinky = require('../util/thinky.js');
var type = thinky.type;

var Website = thinky.createModel("Website", {

    name: type.string().required(),
    description: type.string(),
    thumbnail: type.string(),
    website_alias: type.string(),

    rating: type.number().integer(),
    play_count: type.number().integer(),

    is_fav: type.boolean().default(false),
    is_runner_up:type.boolean().default(false),
    is_exempt_from_one_word_search:type.boolean().default(false),
    is_mainstream: type.boolean().default(false),

    date_added:type.date().default(function () {
        return new Date();
    }),
    date_fav:type.date(),
    date_runner_up:type.date()





});

module.exports = Website;

var Scene = require(__dirname+ '/Scene.js');
var SceneTag = require(__dirname + '/SceneTag.js');
var Picture = require(__dirname+ '/Picture.js');


Website.hasAndBelongsToMany(Scene, "scenes", "id", "id");
Website.hasAndBelongsToMany(Picture, "pictures", "id", "id");
Website.hasAndBelongsToMany(SceneTag, "scene_tags", "id", "id");