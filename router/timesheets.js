const express = require('express');
const timeRouter = express.Router({mergeParams: true});

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');


timeRouter.param('timesheetId', (req,res,next,timesheetId) => {
  const sql = 'SELECT * FROM Timesheet WHERE Timesheet.id = $timesheetId';
  const values = {$timesheetId: timesheetId};
  db.get(sql,values, (error,timesheet) => {
  if(error){
    next(error);
  } else if (timesheet) {
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

timeRouter.get('/', (req, res, next) => {
  const sql = 'SELECT * FROM Timesheet WHERE Timesheet.employee_id = $employeeId';
  const values = { $employeeId: req.params.employeeId};
  db.all(sql, values, (error, timesheets) => {
    if (error) {
      next(error);
    } else {
      res.status(200).json({timesheets: timesheets});
    }
  });
});

timeRouter.post('/', (req,res,next) => {

//sets the new values to be inserted
  const hours = req.body.timesheet.hours,
        rate = req.body.timesheet.rate,
        date = req.body.timesheet.date;

//INSERT query to the database with new timesheet
      const sql = 'INSERT INTO Timesheet (hours, rate,date,employee_id)' +
        'VALUES ($hours, $rate, $date, $employeeId)';
      const values = {
        $hours: hours,
        $rate: rate,
        $date: date,
        $employeeId: req.params.employeeId
      };

//checks if the columns are valid and exist
      if (!hours || !rate || !date) {
        return res.sendStatus(400);
      }
//prints the new row entered to timesheet table
      db.run(sql,values, function(error) {
        if(error){
          next(error);
        } else {
          db.get(`SELECT * FROM Timesheet WHERE Timesheet.id = ${this.lastID}`,
          (error,timesheet) => {
            res.status(201).json({timesheet: timesheet});
          });
        }
      });
});

timeRouter.put('/:timesheetId', (req,res,next) => {


  const hours = req.body.timesheet.hours,
        rate = req.body.timesheet.rate,
        date = req.body.timesheet.date,
        employeeId = req.params.employeeId,
        timesheetId = req.params.timesheetId;

        if(!hours || !rate || !date) {
          return res.sendStatus(400);
        }


        const sql = `UPDATE Timesheet SET hours = $hours, rate = $rate,
                    date = $date WHERE Timesheet.id = $timesheetId`;
        const values = {
              $hours: hours,
              $rate: rate,
              $date: date,
              $timesheetId: req.params.timesheetId
        };


        db.run(sql,values, function(error) {
          if(error){
            next(error);
          } else {
            db.get(`SELECT * FROM Timesheet WHERE Timesheet.id = ${req.params.timesheetId}`,
              (error, timesheet) =>{
                res.status(200).json({timesheet: timesheet});
              });
          }
        });
});

timeRouter.delete('/:timesheetId', (req,res,next) =>{
    const employeeId = req.params.employeeId,
        timesheetId = req.params.timesheetId;

  const sql = 'DELETE FROM Timesheet WHERE Timesheet.id = $timesheetId';
  const values = {
    $timesheetId: req.params.timesheetId
  };


  db.run(sql,values,
  (error) => {
    if (error) {
      next(error);
    } else {
      res.sendStatus(204);
    }
  })

})


module.exports = timeRouter;
