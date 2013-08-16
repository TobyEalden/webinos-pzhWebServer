module.exports = function (app, authConfig, routeutil, serverAddress) {
  var pzhadaptor = require('../../../pzhadaptor.js');
  var transactionManager = require("appg-transactionManager");
  var express = require("express");
  var app = express();
  app.use(express.bodyParser());
  app.use(express.logger());

  app.get("/appg/api/transaction/:id", function(req,res){
    var id = req.param("id");
    var lst = transactionManager.loadTransactions({id: id});
    if (lst.length === 0) {
      res.json({});
    } else {
      res.json(lst[0]);
    }
  });

  app.get('/appg/api/recent/:user', function(req,res) {
    var user = req.param("user");
    var userTrans = transactionManager.loadTransactions({userRecent: user});
    res.json(userTrans);
  });

  app.get('/appg/api/pending/:user', function(req,res) {
    var user = req.param("user");
    var userTrans = transactionManager.loadTransactions({userPending: user});
    res.json(userTrans);
  });

  app.get('/appg/api/transactions', function(req,res) {
    var db = transactionManager.loadTransactions();
    res.json(db);
  });

  app.post('/appg/api/notify', function(req, res) {
    transactionManager.addTransaction(req.body, false, function(err,newTrans) {
      if (err) {
        res.json(err);
      } else {
        // Add notification.
        pzhadaptor.fromWebUnauth( newTrans.target, { type: "addNotification", notificationType: "appgTransaction", data: newTrans }, function(result) {
          if (result && result.message && result.message.id) {
            res.json({ok: true});
          } else {
            res.json({ok: false});
          }
        });
      }
    });
  });

  app.post('/appg/api/request', function(req, res) {
    transactionManager.addTransaction(req.body, true, function(err,newTrans) {
      if (err) {
        res.json(err);
      } else {
        // Add notification.
        pzhadaptor.fromWebUnauth( newTrans.target, { type: "addNotification", notificationType: "appgTransaction", data: newTrans }, function(result) {
          if (result && result.message && result.message.id) {
            res.json({ok: true});
          } else {
            res.json({ok: false});
          }
        });
      }
    });
  });

  app.listen(5000);
}