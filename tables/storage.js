module.exports = (sequelize, DataTypes) => {
    return sequelize.define("storage", {
        account_id: { type: DataTypes.INTEGER, primaryKey: true },
        name: DataTypes.STRING,
        folder_hash: { type: DataTypes.STRING, primaryKey: true }
    })
}