const express = require('express');
const menuRouter = express.Router({mergeParams: true});

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const menuItemsRouter = require('./menu-items.js');

menuRouter.param('menuId', (req,res,next,menuId) =>{
  const sql = 'SELECT * FROM Menu WHERE Menu.id = $menuId';
  const values = {  $menuId: menuId  };
db.get(sql,values, (error,menu) =>{
    if(error){
      next(error);
    } else if(menu) {
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

menuRouter.get('/', (req,res,next) => {
  db.all('SELECT * FROM Menu', (err,menus) =>{
    if(err){
      next(err);
    } else {
      res.status(200).json({menus:menus});
    }
  });
});

menuRouter.post('/', (req,res,next) =>{
  const title = req.body.menu.title;
  const sql = 'INSERT INTO Menu (title) VALUES ($title)';
  const values = {
    $title:title
  };

  if(!title) {
    return res.sendStatus(400);
  }

  db.run(sql,values, function(error) {
    if(error){
      next(error);
    } else {
      db.get(`SELECT * FROM Menu WHERE Menu.id = ${this.lastID}`,
      (error,menu) => {
        res.status(201).json({menu:menu});
      });
    }
  });
});

menuRouter.get('/:id', (req,res,next) => {
  db.get(`SELECT * FROM Menu WHERE Menu.id = ${req.params.id}`,
  (error,menu) => {
    if(error){
      next(error)
    } else if(menu){
      res.status(200).json({menu: menu});
    } else{
      return res.sendStatus(404);
    }
  });
});

menuRouter.put('/:id', (req,res,next) => {
  const title = req.body.menu.title,
        menuId = req.params.id;

  if(!title || !menuId){
    return res.sendStatus(400);
  }

  const sql = `UPDATE Menu SET title = $title WHERE Menu.id = $menuId`;
  const values = {
    $title: title,
    $menuId: req.params.id
  };

  db.run(sql,values, (error) => {
    if(error){
      next(error)
    } else {
      db.get(`SELECT * FROM Menu WHERE Menu.id = ${req.params.id}`,
      (error,menu) =>{
        res.status(200).json({menu:menu});
      });
    }
  });
});

menuRouter.delete('/:id', (req,res,next) =>{
const menuId = req.params.id;

const checkSql = `SELECT * FROM MenuItem WHERE MenuItem.menu_id = $menuId`;
const checkVals = {$menuId: req.params.id};

db.get(checkSql,checkVals, (error, menu) =>{
  if(error){
    next(error);
  } else if (menu){
    return res.sendStatus(400);
  } else {

    db.get(`SELECT * FROM Menu WHERE Menu.id = ${req.params.id}`, (error,menu) =>{
      if(error){
        next(error);
      } else if(menu) {
        const sql = `DELETE FROM Menu WHERE Menu.id = $menuId`;
        const values = {$menuId : req.params.id};

          db.run(sql,values, (error) =>{
            if(error){
              next(error);
            } else {
              res.sendStatus(204);
            }
          });
      } else {
        return res.sendStatus(404);
      }
    })
  }
})
});

menuRouter.use('/:menuId/menu-items', menuItemsRouter);


module.exports = menuRouter;
