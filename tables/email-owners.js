module.exports = (sequelize, DataTypes) => {
    return sequelize.define("email_owners", {
        account_id: { type: DataTypes.INTEGER, primaryKey: true },
        email_addr: { type: DataTypes.STRING, primaryKey: true }
    })
}