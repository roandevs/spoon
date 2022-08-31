module.exports = (sequelize, DataTypes) => {
    return sequelize.define("forwardings", {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        address: DataTypes.STRING,
        forwarding: DataTypes.STRING,
        domain: DataTypes.STRING,
        dest_domain: DataTypes.STRING,
        is_forwarding: DataTypes.INTEGER
    })
}