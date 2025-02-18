export default {
  up: async function (migration, DataTypes) {
    await migration.sequelize.transaction(async () => {
      await migration.addColumn("exports", "hasChanges", {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      });

      await migration.addColumn("runs", "force", {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      });
    });
  },

  down: async function (migration) {
    await migration.sequelize.transaction(async () => {
      await migration.removeColumn("exports", "hasChanges");
      await migration.removeColumn("runs", "force");
    });
  },
};
