var Sequelize = require('../sequelize.js');


var MediaFolder = Sequelize.sequelize.define('MediaFolder', {
    name: {type: Sequelize.Sequelize.STRING, allowNull: false, unique: true},
    path_to_dir: {type: Sequelize.Sequelize.STRING, length: 500},
        
    is_picture: {type: Sequelize.Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
    is_video:{type: Sequelize.Sequelize.BOOLEAN, allowNull: false, defaultValue: false }
    
    


});


module.exports = MediaFolder;