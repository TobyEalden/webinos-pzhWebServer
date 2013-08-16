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
    pzhadaptor.fromWeb(req.user, "addNotification", { notificationType: "appgTransactionResponse", data: { responseTo: id, response: decision } }, function(result) {
      var trans = transactionManager.loadTransactions({id: id});
      res.render("appg/responded", { profile: req.user, trans: trans[0], decision: decision});
    });

//    transactionManager.respondTransaction(id, decision);
  });

  app.post("/appg/savePromptSettings/:pzpId/:enabled", routeutil.ensureAuthenticated, function(req,res) {
    var notificationConfig = utilities.webinosNotifications.notificationManager.getConfig();
    notificationConfig.appgPromptNotification[req.params.pzpId] = req.params.enabled === "true" ? true : false;
    utilities.webinosNotifications.notificationManager.setConfig(notificationConfig);
    res.json({ok: true});
  });

  app.post("/appg/saveTraySettings/:pzpId/:enabled", routeutil.ensureAuthenticated, function(req,res) {
    var notificationConfig = utilities.webinosNotifications.notificationManager.getConfig();
    notificationConfig.trayNotification[req.params.pzpId] = req.params.enabled === "true" ? true : false;
    utilities.webinosNotifications.notificationManager.setConfig(notificationConfig);
    res.json({ok: true});
  });

  app.post("/appg/saveEmailSettings/:email", routeutil.ensureAuthenticated, function(req,res) {
    var notificationConfig = utilities.webinosNotifications.notificationManager.getConfig();
    notificationConfig.appgEmailNotification.email = req.params.email;
    utilities.webinosNotifications.notificationManager.setConfig(notificationConfig);
    res.json({ok: true});
  });

  app.post("/appg/saveSMSSettings/:number", routeutil.ensureAuthenticated, function(req,res) {
    var notificationConfig = utilities.webinosNotifications.notificationManager.getConfig();
    notificationConfig.appgSMSNotification.number = req.params.number;
    utilities.webinosNotifications.notificationManager.setConfig(notificationConfig);
    res.json({ok: true});
  });

  app.post("/appg/saveVoiceSettings/:number", routeutil.ensureAuthenticated, function(req,res) {
    var notificationConfig = utilities.webinosNotifications.notificationManager.getConfig();
    notificationConfig.appgVoiceNotification.number = req.params.number;
    utilities.webinosNotifications.notificationManager.setConfig(notificationConfig);
    res.json({ok: true});
  });
};
