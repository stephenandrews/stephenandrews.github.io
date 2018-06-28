var editor = ace.edit("code");
editor.setTheme("ace/theme/monokai");
function tokenTable(d){
    d = eztz.utility.mic2arr(d);
    $("#tokenDtails").show();
    $("#dis_name").html(d[1]);
    $("#dis_symbol").html(d[2]);
    $("#dis_decimals").html((d[3].toString().length-1));
    $("#tokentable>tbody").empty();
    for(var i = 0; i < d[0].keys.length; i++){      
      $("#tokentable tbody").append('<tr><td style="text-align:center;">'+d[0].keys[i]+'</td><td style="text-align:center;">'+(d[0].vals[i]/d[3]).toFixed((d[3].toString().length-1))+d[2]+'</td></tr> ');
    }
}
copyToClipboard = function(text) {
if (window.clipboardData && window.clipboardData.setData) {
    // IE specific code path to prevent textarea being shown while dialog is visible.
    return clipboardData.setData("Text", text); 

} else if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
    var textarea = document.createElement("textarea");
    textarea.textContent = text;
    textarea.style.position = "fixed";  // Prevent scrolling to bottom of page in MS Edge.
    document.body.appendChild(textarea);
    textarea.select();
    try {
        return document.execCommand("copy");  // Security exception may be thrown by some browsers.
    } catch (ex) {
        console.warn("Copy to clipboard failed.", ex);
        return false;
    } finally {
        document.body.removeChild(textarea);
    }
}}
$('document').ready(function(){
    
    $('button#copy').click(function(e){
      e.preventDefault();
      copyToClipboard($('#compiled').html());
      alert("Copied, time to run it!");
    });
    $('button#copytransfer').click(function(e){
      e.preventDefault();
      copyToClipboard($('#compiled3').html());
      alert("Copied, time to run it!");
    });
    $('button#observe').click(function(e){
      e.preventDefault();
      var contract = $('#contract').val();
      $('#trans_contract').val(contract);
      eztz.contract.storage(contract).then(tokenTable)
      .catch(function(e){alert("There was an error getting your token contract");});
    });
    $('button#transfer').click(function(e){
      var contract = $('#trans_contract').val(),
      from = $('#trans_from').val(),
      to = $('#trans_to').val(),
      amt = $('#trans_amt').val();
      $('button#transfer').val("Loading...");
      $('button#transfer').attr("disabled", true);
      eztz.contract.storage(contract).then(function(r){
        r = eztz.utility.mic2arr(r);
        var dec = r[3];
        var d = '(Pair "'+to+'" (Pair '+(amt*dec).toFixed(0)+' None))';
        console.log(d);
        eztz.rpc.packData(d, "(pair address (pair nat (option bytes)))").then(function(r){
          var d = "0x"+(r.packed).substr(2);
          $("#compiled3").html(`./tezos-client transfer 0 from `+from+` to `+contract+` --arg '`+d+`'`);
          $('button#transfer').val("Transfer");
          $('button#transfer').attr("disabled", false);
          alert("Done - now copy the command and run it in your node!");
          $("#copytransfer").show();
        }).catch(function(e){
          alert("There was an error, try again later");
          $('button#transfer').val("Transfer");
          $('button#transfer').attr("disabled", false);
          alert("There was an error getting your token contract");
        });
      }).catch(function(e){
        $('button#transfer').val("Transfer");
        $('button#transfer').attr("disabled", false);
        alert("There was an error getting your token contract");
      });
      
      e.preventDefault();
    });
    $('button#generate').click(function(e){
      e.preventDefault();
      var name = $('#name').val(),
      symbol = $('#symbol').val(),
      decimals = $('#decimals').val(),
      totalsupply = $('#totalsupply').val(),
      tz = $('#tz').val();
      $('#trans_from').val(tz);
      if (!name || !symbol || !decimals || !totalsupply || !tz) return alert("Please check your inputs");
      totalsupply = totalsupply * Math.pow(10, decimals);
      $('#compiled').html(`./tezos-client originate contract MyToken for `+tz
      +` transferring 0 from `+tz
      +` running 'storage (pair (map address nat) (pair string (pair string nat)));parameter bytes;code{NIL operation;SWAP;UNPAIR;DIP{PAIR};UNPACK (pair address (pair nat (option bytes)));IF_NONE{PUSH string "Failed to unpack bytes";FAILWITH}{};PAIR;NONE nat;NONE nat;PAIR;PAIR;DUP;CDDAAR;DIP{SENDER;};SWAP;MEM;PUSH bool True;CMPNEQ;IF{PUSH string "No token balance found";FAILWITH}{};DUP;CDDAAR;DIP{SENDER;};SWAP;GET;IF_NONE{PUSH string "Key not found in map";FAILWITH}{};SOME;SWAP;SET_CAAR;DUP;CAAR;IF_NONE{PUSH string "Local variable has no value yet: senderBalance";FAILWITH}{};DIP{DUP;CDADAR;};CMPLT;IF{PUSH string "Balance is to low";FAILWITH}{};PUSH nat 0;SOME;SWAP;SET_CADR;DUP;CDDAAR;DIP{DUP;CDAAR;};SWAP;MEM;PUSH bool True;CMPEQ;IF{DUP;CDDAAR;DIP{DUP;CDAAR;};SWAP;GET;IF_NONE{PUSH string "Key not found in map";FAILWITH}{};SOME;SWAP;SET_CADR;}{};DUP;CAAR;IF_NONE{PUSH string "Local variable has no value yet: senderBalance";FAILWITH}{};DIP{DUP;CDADAR;};SUB;SOME;SWAP;SET_CAAR;DUP;CAAR;IF_NONE{PUSH string "Local variable has no value yet: senderBalance";FAILWITH}{};ABS;SOME;SWAP;SET_CAAR;DUP;CADR;IF_NONE{PUSH string "Local variable has no value yet: receiverBalance";FAILWITH}{};DIP{DUP;CDADAR;};ADD;SOME;SWAP;SET_CADR;DUP;CDDAAR;DIP{SENDER;};SWAP;DIIP{DUP;CAAR;IF_NONE{PUSH string "Local variable has no value yet: senderBalance";FAILWITH}{};SOME};DIP{SWAP};UPDATE;SWAP;SET_CDDAAR;DUP;CDDAAR;DIP{DUP;CDAAR;};SWAP;DIIP{DUP;CADR;IF_NONE{PUSH string "Local variable has no value yet: receiverBalance";FAILWITH}{};SOME};DIP{SWAP};UPDATE;SWAP;SET_CDDAAR;DUP;CDADDR;IF_SOME{DIP{PUSH mutez 0;};DIIP{DUP;CDAAR;CONTRACT bytes;IF_NONE{PUSH string "Unable to get contract";FAILWITH}{}};TRANSFER_TOKENS;DROP}{};CDR;CDR;UNPAIR;SWAP;PAIR};' --fee 0 --init '(Pair {Elt "`+tz
      +`" `+ totalsupply.toString()
      +`} (Pair "`+ name
      +`" (Pair "`+ symbol
      +`" `+ Math.pow(10, decimals).toString()
      +`)))'`);
      $("#copy").show();
      alert("Done - now copy the command and run it in your node!");
    });
});
