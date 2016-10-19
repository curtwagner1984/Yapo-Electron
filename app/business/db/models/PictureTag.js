var thinky = require('../util/thinky.js');
var type = thinky.type;

var PictureTag = thinky.createModel("PictureTag", {

    name:type.string().required(),
    thumbnail:type.string(),
    picture_tag_alias:type.string(),

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

module.exports = PictureTag;


var Picture = require(__dirname+ '/Picture.js');

PictureTag.hasAndBelongsToMany(Picture, "pictures", "id", "id");

