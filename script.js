/**
 * ログインスクリーン1 で追加する script
 */
var scriptForLoginScreen1 = function(window) {
  // ログインボタン押下時に実行される CheckLogonInputs に追加処理を差し込む

  var CheckLogonInputs = window.CheckLogonInputs;
  if (!CheckLogonInputs) {
    alert('CheckLogonInputs が見つかりません')
    return;
  }

  window.CheckLogonInputs = function() {
    window.postMessage({
      from:   'page',
      method: 'saveAccountNumber'
    }, '*');
    return CheckLogonInputs();
  };
};


/**
 * ログインスクリーン2 で追加する script
 */
var scriptForLoginScreen2 = function(window) {
  var RPC = {
    inputSecurityCardCords: function(security_card_codes) {
      if (!security_card_codes) return;

      security_card_codes.forEach(function(security_card_code) {
        //console.log('call Replicate("' + security_card_code + '")');
        Replicate(security_card_code);
      });
    }
  };

  // postMessage に対するイベントリスナーを設定
  window.addEventListener('message', function(event) {
    //console.log(event.data);
    if (event.source !== window) return;
    if (event.data.from !== 'extension') return;

    var method = RPC[event.data.method];
    if (method) {
      return method.call(null, event.data.params);
    }
  }, false);

  // グローバル変数から security_card_addresses を取得
  var security_card_addresses = [];
  for (var i = 1; i <= 3; ++i) {
    var var_name = 'fldGridChallange' + i;

    var security_card_address = window[var_name];
    if (security_card_address == null) {
      alert(var_name + ' が見つかりません');
      return;
    }

    security_card_addresses.push(security_card_address);
  }

  // script.js に送信
  window.postMessage({
    from:   'page',
    method: 'getSecurityCardCode',
    params: security_card_addresses
  }, '*');
};


(function($, undefined) {
  var STORAGE_KEY = 'shinsei_power_direct_login_helper';

  function loadStorage(key) {
    var _data = Storage.loadObject(STORAGE_KEY);
    return _data[key];
  }

  function storeStorage(key, data) {
    var _data = Storage.loadObject(STORAGE_KEY);
    _data[key] = data;
    Storage.store(STORAGE_KEY, _data);
  }

  function clearStorage(key) {
    storeStorage(key, undefined);
  }

  /**
   * page に script を追加する
   */
  function addScriptToPage(func) {
    var script = document.createElement('script');
    script.textContent = '(' + func.toString() + ')(window);';
    document.getElementsByTagName('head')[0].appendChild(script);
  }


  var $login_button               = $('#loginbutton');
  var $account_number_input       = $('input[name="fldUserID"]')
  var $security_card_code_1_input = $('#fldGridChg1')

  var RPC = {
    /**
     * 入力している account_number を記憶
     */
    saveAccountNumber: function() {
      var account_number = $account_number_input.val();
      storeStorage('account_number', account_number);
    },

    /**
     *
     */
    getSecurityCardCode: function(security_card_addresses) {
      var request = {
        method: 'getSecurityCardCode',
        params: {
          account_number:          loadStorage('account_number'),
          security_card_addresses: security_card_addresses
        }
      };

      chrome.extension.sendMessage(request, function(response) {
        //console.log(response);
        if (!response) return;

        window.postMessage({
          from: 'extension',
          method: 'inputSecurityCardCords',
          params: response
        }, '*');
      });
    }
  };

  // postMessage に対するイベントリスナーを設定
  window.addEventListener('message', function(event) {
    //console.log(event.data);
    if (event.source !== window) return;
    if (event.data.from !== 'page') return;

    var method = RPC[event.data.method];
    if (method) {
      return method.call(null, event.data.params);
    }
  }, false);

  if ($login_button.length) {
    // ログインスクリーン2
    if ($security_card_code_1_input.length) {
      addScriptToPage(scriptForLoginScreen2);

    // ログインスクリーン1
    } else if ($account_number_input.length) {
      addScriptToPage(scriptForLoginScreen1);
    }
  }
})(jQuery);
