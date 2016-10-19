var thinky = require('../util/thinky.js');
var type = thinky.type;

var Picture = thinky.createModel("Picture", {

    name: type.string().required(),
    description: type.string(),
    thumbnail: type.string(),
    path_to_file: type.string(),
    path_to_dir: type.string(),


    rating: type.number().integer(),
    play_count: type.number().integer(),
    width: type.number().integer(),
    height: type.number().integer(),
    megapixels: type.number(),


    is_fav: type.boolean().default(false),
    is_runner_up:type.boolean().default(false),


    date_added:type.date().default(function () {
        return new Date();
    }),
    date_fav:type.date(),
    date_runner_up:type.date()





});

module.exports = Picture;

var Website = require(__dirname + '/Website.js');
var Actor = require(__dirname + '/Actor.js');
var PictureTag = require(__dirname + '/PictureTag.js');
var TreeFolder = require(__dirname + '/TreeFolder.js');
var ActorTag = require(__dirname + '/ActorTag.js');

Picture.hasAndBelongsToMany(Website, "websites", "id", "id");
Picture.hasAndBelongsToMany(Actor, "actors", "id", "id");
Picture.hasAndBelongsToMany(PictureTag, "picture_tags", "id", "id");
Picture.hasAndBelongsToMany(ActorTag, "actor_tags", "id", "id");

Picture.belongsTo(TreeFolder, "folder", "folderId", "id");