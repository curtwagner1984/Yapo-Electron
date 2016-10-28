var thinky = require('../util/thinky.js');
var type = thinky.type;

var TreeFolder = thinky.createModel("TreeFolder", {

        name: type.string().required(),
        last_folder_name: type.string().required(),
        path_to_folder: type.string().required(),

        level: type.number().integer().required(),

        path_with_ids: [{
            id: type.string().required(),
            name: type.string().required(),
            path_to_folder: type.string().required(),
            last_folder_name: type.string().required(),
            level: type.number().integer().required()


        }],

        date_added: type.date().default(function () {
            return new Date();
        })


    })
    ;

module.exports = TreeFolder;

TreeFolder.ensureIndex("name");
TreeFolder.ensureIndex("path_to_folder");
TreeFolder.ensureIndex("last_folder_name");
TreeFolder.ensureIndex("level");


var Scene = require(__dirname+ '/Scene.js');
var Picture = require(__dirname+ '/Picture.js');

TreeFolder.hasMany(Scene, "scenes", "id", "folderId");
TreeFolder.hasMany(Picture, "pictures", "id", "folderId");
TreeFolder.hasMany(TreeFolder, "sub_folders", "id", "folderId");