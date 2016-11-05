var Sequelize = require('../sequelize.js');


var TreeFolder = Sequelize.sequelize.define('TreeFolder', {
    name: {type: Sequelize.Sequelize.STRING, allowNull: false, unique: true},
    last_folder_name: Sequelize.Sequelize.STRING,
    path_to_folder: {type: Sequelize.Sequelize.STRING, length: 500},

    level:Sequelize.Sequelize.INTEGER
    
});

module.exports = TreeFolder;

TreeFolder.hasMany(TreeFolder, {as: 'subFolders'});
TreeFolder.belongsTo(TreeFolder, {as: 'parent'});
