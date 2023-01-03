'use strict';

module.exports = {
  up(queryInterface) {
    return queryInterface.sequelize.query(`
      CREATE TABLE IF NOT EXISTS recommendationSkinTypes (
        id INTEGER AUTO_INCREMENT,
         
        recommendationId INTEGER NOT NULL,

        skinType TINYINT NOT NULL,
        isIdealSkinType BOOLEAN NOT NULL,

        createdAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY recommendation (recommendationId) REFERENCES recommendations (id) ON DELETE CASCADE ON UPDATE CASCADE,
        PRIMARY KEY (id)
      ) ENGINE=INNODB CHARACTER SET=UTF8MB4 COLLATE UTF8MB4_UNICODE_CI;`);
  },
  down(sequelizeInterface) {
    return sequelizeInterface.dropTable('recommendationSkinTypes');
  }
};
