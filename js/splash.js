(function(){
  var bits;
  
  /*
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
  */
  
  var div2;
  window.code_splash = {
    start: function() {
      var div = $('#code .inner');
      var pos = div.position();
      div.prepend("<div class='bits' style='color:#333;height:300px;width:200px;position:absolute;left:"+(pos.left+5)+"px;top:"+(pos.top+5)+"px'></div>");
      div2 = div.find('.bits');
      
      //prep
      for (var i = 0; i < 100; ++i) {
        window.code_splash.animate();
      }
      
      window.setInterval(function() {
        window.code_splash.animate();
      }, 100);
    },
    
    animate: function() {
      var text = div2.text();
      if (text.length > 200) {
        text = text.substring(2);
      }
      div2.text(text+' '+(Math.random() < 0.5 ? '0' : '1'))
    }
  }
  
  $(document).ready(function() {
    window.code_splash.start();
  })
})();