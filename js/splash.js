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
  
  var div;
  var div2;
  var codeInterval;
  var maxBits = 491;
  window.code_splash = {
    start: function() {
      var block = $('#code');
      div = block.find('.inner');
      var pos = div.position();
      div.prepend("<div class='bits' style='left:"+(pos.left+8)+"px;top:"+(pos.top-17)+"px'></div>");
      div2 = div.find('.bits');
      
      //prep
      for (var i = 0; i <= maxBits; ++i) {
        window.code_splash.animate();
      }
      
      block.mouseover(function() {
        codeInterval = window.setInterval(function() {
          window.code_splash.animate();
        }, 100);
        window.code_splash.animate();
      })
      
      block.mouseout(function() {
        window.clearInterval(codeInterval);
      })
    },
    
    animate: function() {
      var text = div2.text();
      if (text.length > maxBits * 2) {
        text = text.substring(2);
      }
      div2.text(text+' '+(Math.random() < 0.5 ? '0' : '1'))
    }
  }
  
  $(document).ready(function() {
    window.code_splash.start();
  })
  
  $(window).resize(function() {
    if (div2 != null) {
      var pos = div.position();
      div2.css('left', (pos.left+8)+"px");
      div2.css('top', (pos.top-17)+"px");
    }
  })
})();