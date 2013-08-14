module.exports = function (app, authConfig, routeutil, serverAddress) {
  var express = require("express");
  var app = express();
  var fs = require("fs");
  var path = require("path");
  var uuid = require("node-uuid");
  var pzhadaptor = require('../../../pzhadaptor.js');
  app.use(express.bodyParser());
  app.use(express.logger());

  function loadTransactions() {
    var filePath = path.join(__dirname,"transactions.json");
    var lst;
    if (fs.existsSync(filePath)) {
      var contents = fs.readFileSync(filePath);
      lst = JSON.parse(contents);
    } else {
      lst = {};
    }

    return lst;
  }

  function saveTransactions(lst) {
    var filePath = path.join(__dirname,"transactions.json");
    fs.writeFileSync(filePath,JSON.stringify(lst,null,2));
  }

  app.get("/appg/api/transaction/:id", function(req,res){
    var trans;
    var id = req.param("id");
    var db = loadTransactions();
    if (db.hasOwnProperty(id)) {
      trans = db[id]
    } else {
      trans = { error: "id '" + id + "' not found" };
    }

    res.json(trans);
  });

  app.get('/appg/api/user/:user', function(req,res) {
    var userTrans = [];
    var user = req.param("user");
    var db = loadTransactions();
    for (var t in db) {
      var trans = db[t];
      if (trans.hasOwnProperty("target") && trans.target === user) {
        userTrans.push(trans);
      }
    }

    userTrans.sort(function(a,b) {
      var aDate = new Date(a.timestamp);
      var bDate = new Date(b.timestamp);
      return aDate > bDate ? -1 : 1;
    });

    res.json(userTrans);
  });

  app.get('/appg/api/transactions', function(req,res) {
    var db = loadTransactions();
    res.json(db);
  });

  function addTransaction(req, res, blocking) {
    var err;
    var target;
    if (!req.body.hasOwnProperty("target")) {
      // Target - email of account holder
      err = "target field required";
    } else {
      target = req.body.target;
    }

    var origin;
    if (!req.body.hasOwnProperty("origin")) {
      // Originating ID - PayPal
      err = "origin field required";
    } else {
      origin = req.body.origin;
    }

    var source;
    if (!req.body.hasOwnProperty("source")) {
      // Source - Mastercard
      err = "source field required";
    } else {
      source = req.body.source;
    }

    var destination;
    if (!req.body.hasOwnProperty("destination")) {
      // Destination - Amazon
      err = "destination field required";
    } else {
      destination = req.body.destination;
    }

    var value;
    if (!req.body.hasOwnProperty("value")) {
      // Value - 10.50
      err = "value field required"
    } else {
      value = req.body.value;
    }

    var description;
    if (!req.body.hasOwnProperty("description")) {
      // Description - Book
      err = "description field required";
    } else {
      description = req.body.description;
    }

    var currency = "GBP";
    if (req.body.hasOwnProperty("currency")) {
      currency = req.body.currency;
    }

    if (err) {
      res.json(err);
    } else {
      var newTrans = {
        id: uuid.v1(),
        target: target,
        timestamp: new Date(),
        origin: origin,
        source: source,
        destination: destination,
        value: value,
        description: description,
        currency: currency,
        blocking: blocking
      };
      var db = loadTransactions();
      db[newTrans.id] = newTrans;
      saveTransactions(db);

      pzhadaptor.fromWebUnauth( target, { type: "addNotification", notificationType: "appgTransaction", data: newTrans }, function(result) {
        if (result && result.message && result.message.id) {
          res.json({ok:true});
        } else {
          res.json({ok:false});
        }
      });
    }
  }

  app.post('/appg/api/notify', function(req, res) {
    addTransaction(req, res, false);
  });

  app.post('/appg/api/request', function(req, res) {
    addTransaction(req, res, true);
  });

  app.listen(5000);
}