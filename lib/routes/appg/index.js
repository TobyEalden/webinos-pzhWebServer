module.exports = function (app, authConfig, routeutil, serverAddress) {
  var pzhadaptor = require('../../pzhadaptor.js');
  var utilities = require("webinos-utilities");
  var transactionManager = require("appg-transactionManager");

  app.get("/appg", routeutil.ensureAuthenticated, function(req,res) {
    res.render("appg/home", { profile:req.user });
  });

  app.get("/appg/about", routeutil.ensureAuthenticated, function(req,res) {
    res.render("appg/about", { profile:req.user });
  });

  app.get("/appg/settings", routeutil.ensureAuthenticated, function(req,res) {
    pzhadaptor.fromWeb(req.user, 'getPzps', {} , function(pzps) {
      pzhadaptor.fromWeb(req.user, 'getNotificationConfig', {}, function(data) {
        var notificationConfig = data.message;
        if (!notificationConfig.hasOwnProperty("appgEmailNotification")) notificationConfig.appgEmailNotification = { email: "" };
        if (!notificationConfig.hasOwnProperty("appgSMSNotification")) notificationConfig.appgSMSNotification = { number: "" };
        if (!notificationConfig.hasOwnProperty("appgVoiceNotification")) notificationConfig.appgVoiceNotification = { number: "" };
        res.render("appg/settings", { profile:req.user, pzps: pzps.message.signedCert, notificationConfig: notificationConfig, csrf: req.session._csrf });
      });
    });
  });

  app.get("/appg/transactions", routeutil.ensureAuthenticated, function(req, res) {
    var recentTransactions = transactionManager.loadTransactions({ userRecent: req.user.emails[0].value });
    var pendingTransactions = transactionManager.loadTransactions({ userPending: req.user.emails[0].value });
    res.render("appg/transactions", { profile:req.user, recent: recentTransactions, pending: pendingTransactions });
  });

  app.get("/appg/response/:decision/:id", routeutil.ensureAuthenticated, function(req,res) {
    var id = req.params.id;
    var decision = req.params.decision;
    pzhadaptor.fromWeb(req.user, "addTransactionResponse", { data: { responseToTransaction: id, response: decision } }, function(result) {
      var trans = transactionManager.loadTransactions({id: id});
      res.render("appg/responded", { profile: req.user, trans: trans[0], decision: decision});
    });
  });

  app.post("/appg/savePromptSettings/:pzpId/:enabled", routeutil.ensureAuthenticated, function(req,res) {
    pzhadaptor.fromWeb(req.user, "saveNotificationConfig", { key: "appgPromptNotification", subKey: req.params.pzpId, value: (req.params.enabled === "true" ? true : false) }, function(result) {
      res.json({ok: result.message.ok});
    });
  });

  app.post("/appg/saveTraySettings/:pzpId/:enabled", routeutil.ensureAuthenticated, function(req,res) {
    pzhadaptor.fromWeb(req.user, "saveNotificationConfig", { key: "trayNotification", subKey: req.params.pzpId, value: (req.params.enabled === "true" ? true : false) }, function(result) {
      res.json({ok: result.message.ok});
    });
  });

  app.post("/appg/saveEmailSettings/:email", routeutil.ensureAuthenticated, function(req,res) {
    pzhadaptor.fromWeb(req.user, "saveNotificationConfig", { key: "appgEmailNotification", subKey: "email", value: req.params.email }, function(result) {
      res.json({ok: result.message.ok});
    });
  });

  app.post("/appg/saveSMSSettings/:number", routeutil.ensureAuthenticated, function(req,res) {
    pzhadaptor.fromWeb(req.user, "saveNotificationConfig", { key: "appgSMSNotification", subKey: "number", value: req.params.number }, function(result) {
      res.json({ok: result.message.ok});
    });
  });

  app.post("/appg/saveVoiceSettings/:number", routeutil.ensureAuthenticated, function(req,res) {
    pzhadaptor.fromWeb(req.user, "saveNotificationConfig", { key: "appgVoiceNotification", subKey: "number", value: req.params.number }, function(result) {
      res.json({ok: result.message.ok});
    });
  });
};
