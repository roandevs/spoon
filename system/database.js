const sequelize = require('sequelize');
const config = require('../config');

const mainDatabase = new sequelize({
    host: config.database.host,
    port: 5432,
    username: config.database.username,
    password: config.database.password,
    database: config.database.mainName,
    dialect: "postgres",
    logging: false,
    dialectOptions: {
        timezone: process.env.db_timezone
    },
    define: {
        freezeTableName: true,
        timestamps: false
    }
});

const emailDatabase = new sequelize({
    host: config.database.host,
    port: 5432,
    username: config.database.username,
    password: config.database.password,
    database: config.database.mailName,
    dialect: "postgres",
    logging: false,
    dialectOptions: {
        timezone: process.env.db_timezone
    },
    define: {
        freezeTableName: true,
        timestamps: false
    }
});
const emailOwners = require('../tables/email-owners.js')(mainDatabase, sequelize.DataTypes);
const account = require('../tables/account.js')(mainDatabase, sequelize.DataTypes);
const inviteCodes = require('../tables/invite-codes.js')(mainDatabase, sequelize.DataTypes);
const storage = require('../tables/storage.js')(mainDatabase, sequelize.DataTypes);

account.hasMany(emailOwners, {foreignKey: 'account_id'});
emailOwners.belongsTo(account, {foreignKey: 'account_id'});

account.hasMany(inviteCodes, {foreignKey: 'generated_by'});
inviteCodes.belongsTo(account, {foreignKey: 'generated_by'});

account.hasMany(storage, {foreignKey: 'account_id'});
storage.belongsTo(account, {foreignKey: 'account_id'});

module.exports = {
    storage,
    inviteCodes,
    emailOwners,
    account,
    mailbox: require('../tables/mailbox.js')(emailDatabase, sequelize.DataTypes),
    forwardings: require('../tables/forwardings.js')(emailDatabase, sequelize.DataTypes)
};