(function() {
  var restClient = require("node-rest-client").Client;

  var TransactionApi = function(urlBase) {
    this.urlBase = urlBase;
    this.apiClient = new restClient();
  };

  TransactionApi.prototype.getUserTransactions = function(usr, callback) {
    var args = { path: { "user": usr }};

    this.apiClient.get(this.urlBase + "/user/${user}", args, function(data,response) {
      callback(data);
    });
  }


  module.exports.TransactionApi = TransactionApi;
}())