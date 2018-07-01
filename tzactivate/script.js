$('document').ready(function(){
    $('button#activate').click(function(e){
      e.preventDefault();
      var address = $('#address').val(),
      activation = $('#activation').val();
      $('button#activate').attr("disabled", true);
      eztz.rpc.activate(address, activation).then(function(r){
        alert("Your account has been activated!");
        $('button#activate').attr("disabled", false);
      }).catch(function(e){
        alert("There was an error activating this account - either the code is incorrect or this has already been activated.");
        $('button#activate').attr("disabled", false);
      });
    });
});
