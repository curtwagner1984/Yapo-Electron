var thinky = require('../util/thinky.js');
var type = thinky.type;

var Actor = thinky.createModel("Actor", {
    
    name: type.string().required(),
    actor_alias: type.array(),
    gender: type.string().enum(['Male','Female','Trans-gender']).default('Female'),
    description: type.string(),
    thumbnail: type.string(),
    imdb_id: type.string(),
    tmdb_id: type.string(),
    official_pages: type.string(),
    ethnicity: type.string(),
    weight: type.string(),
    height: type.string(),
    country_of_origin: type.string(),
    tattoos: type.string(),
    measurements: type.string(),

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
    date_runner_up:type.date(),
    date_of_birth:type.date()

    


});

module.exports = Actor;


var Scene = require(__dirname+ '/Scene.js');
var Picture = require(__dirname+ '/Picture.js');
var Tag = require(__dirname+ '/Tag.js');

Actor.hasAndBelongsToMany(Scene, "scenes", "id", "id");
Actor.hasAndBelongsToMany(Picture, "pictures", "id", "id");
Actor.hasAndBelongsToMany(Tag, "tags", "id", "id");
