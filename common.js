var Storage = (function(undefined) {
  return {
    load: function(key) {
      var json = localStorage[key];
      if (json != null) {
        try {
          return JSON.parse(json)
        } catch(e) {}
      }
      return undefined;
    },

    loadObject: function(key) {
      var data = Storage.load(key)
      return jQuery.isPlainObject(data) ? data : {};
    },

    store: function(key, data) {
      localStorage[key] = JSON.stringify(data);
    }
  };
})();


var Account = (function() {
  function Account(number, security_card_codes) {
    this.number               = number;
    this._security_card_codes = security_card_codes;
  }

  /**
   * security_card_address を受け取り security_card_code を返す
   */
  Account.prototype.getSecurityCardCode = function(security_card_address) {
    var col_char = security_card_address.charAt(0);
    var row_char = security_card_address.charAt(1);

    address_index =
      Number(row_char) * Account.COL_CHARS.length +
      Account.COL_CHARS.indexOf(col_char)

    return this._security_card_codes.charAt(address_index);
  };

  // 列の文字
  Account.COL_CHARS = 'ABCDEFGHIJ';

  // 行数
  Account.ROWS = 5;

  Account.find = function(account_number) {
    var accounts = Storage.loadObject('accounts');
    var security_card_codes = accounts[account_number];
    if (security_card_codes) {
      return new Account(account_number, security_card_codes);
    } else {
      return null;
    }
  };

  Account.save = function(account_number, security_card_codes) {
    var accounts = Storage.loadObject('accounts');
    accounts[account_number] = security_card_codes.join('');
    Storage.store('accounts', accounts);
  };

  return Account;
})();
