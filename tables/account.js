module.exports = (sequelize, DataTypes) => {
    return sequelize.define("account", {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        username: { type: DataTypes.STRING },
        password: DataTypes.STRING,
        created_at: DataTypes.DATE,
        encr_session_password: DataTypes.STRING,
        vip: DataTypes.BOOLEAN,
        active: DataTypes.BOOLEAN,
        storage_quota: DataTypes.STRING
    })
}