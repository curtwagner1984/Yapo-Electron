var Sequelize = require('../sequelize.js');




var Scene = Sequelize.sequelize.define('Scene', {
    name: {type: Sequelize.Sequelize.STRING, allowNull: false},
    description: Sequelize.Sequelize.TEXT,
    path_to_file: {type: Sequelize.Sequelize.STRING, length: 500, unique: true},
    path_to_dir: {type: Sequelize.Sequelize.STRING, length: 500},
    thumbnail: {type: Sequelize.Sequelize.STRING, length: 500},
    codec_name: Sequelize.Sequelize.STRING,
  
    bit_rate: Sequelize.Sequelize.INTEGER,
    duration: Sequelize.Sequelize.INTEGER,
    size: Sequelize.Sequelize.INTEGER,
    framerate: Sequelize.Sequelize.FLOAT,
    width: Sequelize.Sequelize.INTEGER,
    height: Sequelize.Sequelize.INTEGER,
    rating: Sequelize.Sequelize.INTEGER,
    play_count: Sequelize.Sequelize.INTEGER,


    is_fav: {type: Sequelize.Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
    is_runner_up:{type: Sequelize.Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
    

    date_fav: {type: Sequelize.Sequelize.DATE, defaultValue: null},
    date_runner_up:{type: Sequelize.Sequelize.DATE, defaultValue: null},
    date_last_lookup:{type: Sequelize.Sequelize.DATE, defaultValue: null}


});



module.exports = Scene;

var Actor = require('./Actor.js');
var Tag = require('./Tag.js');
var Website = require('./Website.js');

Scene.belongsToMany( Actor, {
    as: 'actors',
    through: 'Scene_actor',
    foreignKey: 'Scene_id'
});

Scene.belongsToMany( Tag, {
    as: 'tags',
    through: 'Scene_tag',
    foreignKey: 'Scene_id'
});

Scene.belongsToMany( Website, {
    as: 'websites',
    through: 'Scene_website',
    foreignKey: 'Scene_id'
});