(function(){
  var bits;
  
  window.code_splash = {
    start: function() {
      var div = $('#code');
      var pos = div.position();
      for (var x = 0; x < 5; ++x) {
        for (var y = 0; y < 5; ++y) {
          div.prepend("<div class='bit' style='left:"+(pos.left+5+(25*x))+"px;top:"+(pos.top+5+(25*y))+"px;background-color:#333' />");
        }
      }
      
      bits = $('.bit');
      
      window.setInterval(function() {
        bits.each(function() {
          this.style.backgroundColor = "blue";
          this.style.left += 1;
        })
      }, 500);
    }
  }
  
  $(document).ready(function() {
    window.code_splash.start();
  })
})();