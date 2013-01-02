(function($, undefined) {
  $(function() {
    buildSecurityCardInputs();

    $('#templates > .edit-account').submit(function(event) {
      event.preventDefault();
      save($(this));
    });

    //「口座を追加する」追加するボタンをクリック
    $('#add_account').click(function() {
      $('#add_account_container').before(
        $('<li>').append(
          $('#templates > .edit-account').clone(true)
        )
      );
    });
  });

  /**
   * 正しい口座番号かどうか返す
   */
  function isValidAccountNumber(account_number) {
    return /^\d{10}$/.test(account_number);
  }

  /**
   * 正しいセキュリティーカードの入力かどうか返す
   */
  function isValidSecurityCardCode(security_card_code) {
    return /^[\dA-Z]$/.test(security_card_code);
  }

  /**
   * 保存
   */
  function save($form) {
    var $account_number_input = $form.find('input[name="account_number"]');
    var $security_card_inputs = $form.find('.security-card input');

    var has_error = false;

    var account_number = $account_number_input.val();
    if (isValidAccountNumber(account_number)) {
      $account_number_input.removeClass('error');
    } else {
      $account_number_input.addClass('error');
      has_error = true;
    }

    var security_card_codes = [];
    $security_card_inputs.each(function() {
      var $security_card_input = $(this);
      var security_card_code = $security_card_input.val().toUpperCase();
      if (!isValidSecurityCardCode(security_card_code)) {
        $security_card_input.addClass('error');
        has_error = true;
      }
      security_card_codes.push(security_card_code);
    });

    // エラーがあれば終了
    if (has_error) return;

    Account.save(account_number, security_card_codes);
  }

  /**
   * セキュリティーカードの入力フォームを作成
   */
  function buildSecurityCardInputs() {
    var $table = $('#templates > .edit-account .security-card');

    for (var row_i = 0; row_i < Account.ROWS + 1; ++row_i) {
      // 行を作成
      var $tr = $('<tr>');

      // 左ヘッダを作成
      var $th = $('<th>');
      if (row_i > 0) {
        var row_char = String(row_i - 1);
        $th.text(row_char);
      }
      $tr.append($th);

      for (var col_i = 0, len = Account.COL_CHARS.length; col_i < len; ++col_i) {
        if (row_i === 0) {
          // 上ヘッダを作成
          var col_char = Account.COL_CHARS.charAt(col_i);
          $tr.append(
            $('<th>').text(col_char)
          );

        } else {
          // ボディ部を作成
          $tr.append(
            $('<td>').append(
              $('<input>', { maxlength: 1 })
                .keyup(onKeyUpForSecurityCard)
            )
          );
        }
      }

      $table.append($tr);
    }

    /**
     * セキュリティーカード入力で keyup イベントが発生した時のイベントハンドラ
     */
    function onKeyUpForSecurityCard(event) {
      var $input = $(this);
      var value  = $input.val();

      // 入力されていなければ skip
      if (value.length === 0) return;

      // 入力内容が正しい場合
      if (/^[\da-z]/i.test(value)) {
        $input.removeClass('error');

      // 入力内容が正しくない場合
      } else {
        $input.addClass('error');
        return;
      }

      // 元の value を保存
      var original_value = value;

      // 2文字以上入力されていたら、1文字に切り詰める
      if (value.length > 1) {
        value = value.charAt(0);
      }

      // 英小文字は英大文字に変換する
      value = value.toUpperCase();

      // 値が変更されていたら、入力フォームに再セットする
      if (value !== original_value) {
        $input.val(value);
      }

      // 押下したキーが [0-9a-z] かつ alt, ctrl, meta が押されていない場合
      if ((event.keyCode >= 48 && event.keyCode <= 57 ||
           event.keyCode >= 65 && event.keyCode <= 90) &&
          !event.altKey && !event.ctrlKey && !event.metaKey) {
        // フォーカスを次の input に移す
        focusNextSecurityCardInput($input);
      }
    }

    /**
     * 次のセキュリティーカード入力 input にフォーカスを移動する
     */
    function focusNextSecurityCardInput($current_input) {
      var $parent_td = $current_input.parent();

      // input < td + td > input を探す
      var $next_input = $parent_td.next().find('input');

      // なければ
      if ($next_input.length === 0) {
        // input < td < tr + tr input[0] を探す
        $next_input = $parent_td.parent().next().find('input:eq(0)');
      }

      $next_input.focus();
      $next_input.select();
    }
  }
})(jQuery);
