var Sequelize = require('sequelize');
var auxFunc = require('../../../business/util/auxFunctions');

var sequelize = new Sequelize(undefined,undefined,undefined, {
        dialect: 'sqlite',
        storage: auxFunc.appRootDir + '/yapoDb.sqlite',
        logging: false
    }
);


module.exports.Sequelize = Sequelize;
module.exports.sequelize = sequelize;