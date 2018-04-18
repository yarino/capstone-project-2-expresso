const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite')

db.serialize(function() {
    db.run('DROP TABLE IF EXISTS Employee', error => {
      if(error){
        throw error;
      }
    });
    db.run('CREATE TABLE IF NOT EXISTS `Employee` ( ' +
             '`id` INTEGER NOT NULL PRIMARY KEY, ' +
             '`name` TEXT NOT NULL, ' +
             '`position` TEXT NOT NULL, ' +
             '`wage` INTEGER NOT NULL, ' +
             '`is_current_employee` INTEGER DEFAULT 1 )'
           );

     db.run('DROP TABLE IF EXISTS Timesheet', error => {
       if(error){
         throw error;
       }
     });
     db.run('CREATE TABLE IF NOT EXISTS `Timesheet` ( ' +
              '`id` INTEGER NOT NULL PRIMARY KEY, ' +
              '`hours` INTEGER NOT NULL, ' +
              '`rate` INTEGER NOT NULL, ' +
              '`date` INTEGER NOT NULL, ' +
              '`employee_id` INTEGER NOT NULL, ' +
              'FOREIGN KEY(`employee_id`) REFERENCES `Employee`(`id`) )'
    );

    db.run('DROP TABLE IF EXISTS Menu', error => {
      if(error){
        throw error;
      }
    });
    db.run('CREATE TABLE IF NOT EXISTS `Menu` ( ' +
             '`id` INTEGER NOT NULL PRIMARY KEY, ' +
             '`title` TEXT NOT NULL )'
    );

    db.run('DROP TABLE IF EXISTS MenuItem', error => {
      if(error){
        throw error;
      }
    });

    db.run('CREATE TABLE IF NOT EXISTS `MenuItem` ( ' +
             '`id` INTEGER NOT NULL PRIMARY KEY, ' +
             '`name` TEXT NOT NULL, ' +
             '`description` TEXT, ' +
             '`inventory` INTEGER NOT NULL, ' +
             '`price` INTEGER NOT NULL, ' +
             '`menu_id` INTEGER NOT NULL, ' +
             'FOREIGN KEY(`menu_id`) REFERENCES `Menu`(`id`) )'
   );


});
