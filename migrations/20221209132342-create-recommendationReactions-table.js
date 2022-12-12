'use strict';

module.exports = {
  up(queryInterface) {
    return queryInterface.sequelize.query(`
      CREATE TABLE IF NOT EXISTS recommendationReactions (
        id INTEGER AUTO_INCREMENT,
         
        recommendationId INTEGER NOT NULL,
        userId INTEGER NOT NULL,

        description VARCHAR(200) NULL,
        reactionType TINYINT NOT NULL,

        createdAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY recommendation (recommendationId) REFERENCES recommendations (id) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY user (userId) REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE,
        PRIMARY KEY (id)
      ) ENGINE=INNODB CHARACTER SET=UTF8MB4 COLLATE UTF8MB4_UNICODE_CI;`);
  },
  down(sequelizeInterface) {
    return sequelizeInterface.dropTable('recommendationReactions');
  }
};
