var Sequelize = require('../sequelize.js');


var Tag = Sequelize.sequelize.define('Tag', {
    name: {type: Sequelize.Sequelize.STRING, allowNull: false, unique: true},
    description: Sequelize.Sequelize.TEXT,
    thumbnail: {type: Sequelize.Sequelize.STRING, length: 500},


    rating: Sequelize.Sequelize.INTEGER,
    play_count: Sequelize.Sequelize.INTEGER,


    is_fav: {type: Sequelize.Sequelize.BOOLEAN, allowNull: false, defaultValue: false},
    is_runner_up: {type: Sequelize.Sequelize.BOOLEAN, allowNull: false, defaultValue: false},
    is_exempt_from_one_word_search: {type: Sequelize.Sequelize.BOOLEAN, allowNull: false, defaultValue: false},
    is_mainstream: {type: Sequelize.Sequelize.BOOLEAN, allowNull: false, defaultValue: false},

    date_fav: {type: Sequelize.Sequelize.DATE, defaultValue: null},
    date_runner_up: {type: Sequelize.Sequelize.DATE, defaultValue: null}
    

});


module.exports = Tag;

var TagAlias = require('./TagAlias.js');
var Website = require('./Website.js');
var Actor = require('./Tag.js');
var Scene = require('./Scene.js');
var Picture = require('./Picture.js');

Tag.belongsToMany( Website, {
    as: 'websites',
    through: 'Website_tag',
    foreignKey: 'Tag_id'
});


Tag.belongsToMany( Actor, {
    as: 'actors',
    through: 'Actor_tag',
    foreignKey: 'Tag_id'
});

Tag.belongsToMany( Scene, {
    as: 'scenes',
    through: 'Scene_tag',
    foreignKey: 'Tag_id'
});

Tag.belongsToMany( Picture, {
    as: 'tags',
    through: 'Picture_tag',
    foreignKey: 'Tag_id'
});