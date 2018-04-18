const express = require('express');
const employeesRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const timeRouter = require('./timesheets.js');

//param router to catch any employeeId calls
employeesRouter.param('employeeId', (req,res,next,employeeId) =>{
  //creates the query inside a var
  const sql = 'SELECT * FROM Employee WHERE Employee.id = $employeeId';
  //defines value as to what is employeeId
  const values = {$employeeId: employeeId};

  //calls the query from the database
  db.get(sql,values, (error,employee) =>{
    if(error){
      //sends to error handler middleware
      next(error);
    } else if (employee){
      //sets the employee returned in req.employee value
      req.employee = employee
      //calls next for the next router to catch
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

//reference the time router for calls that needs the employeeId
employeesRouter.use('/:employeeId/timesheets', timeRouter);

//GET Method for Employee
employeesRouter.get('/', (req,res,next) => {
  db.all('SELECT * FROM Employee WHERE is_current_employee = 1',
  (err,employees) =>{
    if(err){
      next(err);
    } else {
      res.status(200).json({employees: employees});
    }
  });
});

//Gets the specific employee ID using the param router
employeesRouter.get('/:employeeId', (req,res,next) =>{
  res.status(200).json({employee: req.employee});
});

employeesRouter.post('/', (req,res,next) =>{
//checks the req body fields returned on call
  // console.log(req.body.employee)

  //saves the information into variables
  const name = req.body.employee.name,
        position = req.body.employee.position,
        wage = req.body.employee.wage;

//checks if any of the required fields are missing - sends 400 status if so
        if(!name || !position || !wage) {
          return res.sendStatus(400);
        }

//sets the query and values to be called
  const sql = 'INSERT INTO Employee (name, position, wage)' +
              'VALUES ($name, $position, $wage)';
  const values = {
    $name: name,
    $position: position,
    $wage: wage
  };

//performs db run to select the requested ID of the latest employee inserted to the db
  db.run(sql,values, function(error) {
    if(error){
      next(error);
    } else{
      db.get(`SELECT * FROM Employee WHERE Employee.id = ${this.lastID}`,
        (error,employee) =>{
          res.status(201).json({employee:employee});
        });
    }
  });
});

employeesRouter.put('/:employeeId', (req,res,next) =>{
  //console.log(req.body.employee);
  const name = req.body.employee.name,
        position = req.body.employee.position,
        wage = req.body.employee.wage;

//checks if any fields missing
  if(!name || !position || !wage){
    return res.sendStatus(400);
  }

//update query that sets the values into the fields of the employee
const sql = 'UPDATE Employee SET name = $name, ' +
          'position = $position, wage = $wage WHERE Employee.id = $employeeId';

const values = {
  $name: name,
  $position: position,
  $wage: wage,
  $employeeId: req.params.employeeId
};

db.run(sql,values, (error) => {
  if(error){
    next(error);
  } else {
    db.get(`SELECT * FROM Employee WHERE id = ${req.params.employeeId}`,
    (error, employee) => {
      res.status(200).json({employee: employee})
    })
  }
})

employeesRouter.delete('/:Id', (req,res,next) => {
  const sql = 'UPDATE Employee SET is_current_employee = 0 WHERE Employee.id = $id';
  const values = {$id: req.params.Id};


  db.run(sql,values, (error) =>{
    if(error){
      next(error);
    } else{
      db.get(`SELECT * FROM Employee WHERE Employee.id = ${req.params.Id}`,
      (error,employee) => {
        res.status(200).json({employee: employee})
      })
    }
  });
});

})

module.exports = employeesRouter;
