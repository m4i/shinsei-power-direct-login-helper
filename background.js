(function($, undefined) {
  var RPC = {
    getSecurityCardCode: function(params) {
      var account = Account.find(params.account_number);
      if (!account) return null;

      return params.security_card_addresses.map(
        function(security_card_address) {
          return account.getSecurityCardCode(security_card_address);
        }
      );
    }
  };

  chrome.extension.onMessage.addListener(
    function(request, sender, sendResponse) {
      //console.log(request);
      var method = RPC[request.method];
      if (method) {
        var response = method.call(sender, request.params);
        sendResponse(response);
      } else {
        sendResponse({});
      }
    }
  );
})();
