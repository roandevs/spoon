module.exports = (sequelize, DataTypes) => {
    return sequelize.define("invite_codes", {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        invite_code: DataTypes.STRING,
        created_at: DataTypes.DATE,
        generated_by: DataTypes.INTEGER,
        used: DataTypes.BOOLEAN,
        used_by: DataTypes.STRING
    })
}