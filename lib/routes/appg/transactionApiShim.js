(function() {
  var restClient = require("node-rest-client").Client;

  var TransactionApi = function(urlBase) {
    this.urlBase = urlBase;
    this.apiClient = new restClient();
  };

  TransactionApi.prototype.getUserRecentTransactions = function(usr, callback) {
    var args = { path: { "user": usr }};

    this.apiClient.get(this.urlBase + "/recent/${user}", args, function(data,response) {
      callback(data);
    });
  }

  TransactionApi.prototype.getUserPendingTransactions = function(usr, callback) {
    var args = { path: { "user": usr }};

    this.apiClient.get(this.urlBase + "/pending/${user}", args, function(data,response) {
      callback(data);
    });
  }

  module.exports.TransactionApi = TransactionApi;
}())