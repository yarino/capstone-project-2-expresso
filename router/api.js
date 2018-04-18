const express = require('express');
const apiRouter = express.Router();
const employeesRouter = require('./employees.js');
const timeRouter = require('./timesheets.js');
const menuRouter = require('./menus.js');
const menuItemsRouter = require('./menu-items.js');

apiRouter.use('/employees', employeesRouter);
apiRouter.use('/timesheets', timeRouter);
apiRouter.use('/menus', menuRouter);
apiRouter.use('/menu-items', menuItemsRouter);

module.exports = apiRouter;
