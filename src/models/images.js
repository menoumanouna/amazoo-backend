export default (sequelize, DataTypes) => {
  return sequelize.define(
    "image",
    {
      path: DataTypes.STRING,
      habitat_id: DataTypes.INTEGER,
      animal_id: DataTypes.INTEGER,
      service_id: DataTypes.INTEGER,
    },
    { timestamps: false },
  );
};
