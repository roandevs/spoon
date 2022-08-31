module.exports = (sequelize, DataTypes) => {
    return sequelize.define("mailbox", {
        username: { type: DataTypes.STRING, primaryKey: true },
        password: DataTypes.STRING,
        name: DataTypes.STRING,
        storagebasedirectory: DataTypes.STRING,
        storagenode: DataTypes.STRING,
        maildir: DataTypes.STRING,
        quota: DataTypes.INTEGER, 
        domain: DataTypes.STRING, 
        active: DataTypes.INTEGER, 
        passwordlastchange:  DataTypes.DATE, 
        created: DataTypes.DATE
    })
}