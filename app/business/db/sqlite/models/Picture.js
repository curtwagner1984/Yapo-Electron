var Sequelize = require('../sequelize.js');




var Picture = Sequelize.sequelize.define('Picture', {
    name: {type: Sequelize.Sequelize.STRING, allowNull: false},
    description: Sequelize.Sequelize.TEXT,
    path_to_file: {type: Sequelize.Sequelize.STRING, length: 500, unique:true},
    path_to_dir: {type: Sequelize.Sequelize.STRING, length: 500},
    thumbnail: {type: Sequelize.Sequelize.STRING, length: 500},
    
    
    size: Sequelize.Sequelize.INTEGER,
    width: Sequelize.Sequelize.INTEGER,
    megapixel: Sequelize.Sequelize.FLOAT,
    height: Sequelize.Sequelize.INTEGER,
    rating: Sequelize.Sequelize.INTEGER,
    play_count: Sequelize.Sequelize.INTEGER,


    is_fav: {type: Sequelize.Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
    is_runner_up:{type: Sequelize.Sequelize.BOOLEAN, allowNull: false, defaultValue: false },


    date_fav: {type: Sequelize.Sequelize.DATE, defaultValue: null},
    date_runner_up:{type: Sequelize.Sequelize.DATE, defaultValue: null},
    date_last_lookup:{type: Sequelize.Sequelize.DATE, defaultValue: null}


});



module.exports = Picture;

var Actor = require('./Actor.js');
var Tag = require('./Tag.js');
var Website = require('./Tag.js');

Picture.belongsToMany( Actor, {
    as: 'actors',
    through: 'Picture_actor',
    foreignKey: 'Picture_id'
});

Picture.belongsToMany( Tag, {
    as: 'tags',
    through: 'Picture_tag',
    foreignKey: 'Picture_id'
});

Picture.belongsToMany( Website, {
    as: 'websites',
    through: 'Picture_website',
    foreignKey: 'Picture_id'
});