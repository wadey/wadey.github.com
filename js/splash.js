(function(){
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
  var maxBits;
  window.code_splash = {
    start: function() {
      var block = $('#code');
      div = block.find('.inner');
      var pos = div.position();
      div.prepend("<div class='bits' style='left:"+(pos.left+8)+"px;top:"+(pos.top-17)+"px'></div>");
      div2 = div.find('.bits');
      
      //prep
      for (maxBits = 0; div2.height() < 200; ++maxBits) {
        window.code_splash.animate();
      }
      
      //back up
      maxBits-=2;
      div2.text(div2.text().substring(2));
      
      block.mouseover(function() {
        div2.css('color', '#333')
        codeInterval = window.setInterval(function() {
          window.code_splash.animate();
        }, 100);
        window.code_splash.animate();
      })
      
      block.mouseout(function() {
        window.clearInterval(codeInterval);
        div2.css('color', '#222')
      })
    },
    
    animate: function() {
      var text = div2.text();
      if (text.length >= maxBits * 2) {
        text = text.substring(2);
      }
      div2.text(text+' '+(Math.random() < 0.5 ? '0' : '1'))
    },
    
    onclick: function(e) {
      window.location = $('#code h2 a')[0].href
    }
  }
  
  $(document).ready(function() {
    code_splash.start();
    $('#code').click(code_splash.onclick)
  })
  
  $(window).resize(function() {
    if (div2 != null) {
      var pos = div.position();
      div2.css('left', (pos.left+8)+"px");
      div2.css('top', (pos.top-17)+"px");
    }
  })
})();

(function(){
  var container;
  window.photos_splash = {
    start: function() {
      $.getJSON("http://api.flickr.com/services/feeds/photos_public.gne?id=41964757%40N00&format=json&jsoncallback=?", function(data) {
        photos_splash.data_loaded(data);
      })
    },
    
    data_loaded: function(photos_data) {
      var pos = $('#photos .inner').position()
      var x = 0;
      var y = 0;
      var i = 0;
      
      container = $('#photos .container')
      container.css('left', (pos.left + 5) + "px")
      container.css('top', (pos.top - 15) + "px")
      
      var root_x = 0;
      var root_y = 0;
      
      $.each(photos_data.items, function(i,item){
        var media_s = item.media.m.replace(/_m.jpg$/, '_s.jpg')
        //$('#photos').prepend("<img src='"+media_s+"' class='ft' style='left:"+x+"px;top:"+y+"px' /> ")
        container.prepend("<img src='"+media_s+"' class='ft' style='width:58px;left:"+(root_x+(x*65))+"px;top:"+(root_y+(y*65))+"px' /> ")
        x+=1;
        i+=1;
        if (x == 3) {
          x = 0;
          y += 1;
        }
        if (i == 9) {
          x = 0;
          y = 0;
          root_x += 595 - (65*3)
          //root_y -= 15
        }
        if (i == 18) {
          return false;
        }
      })
    },
    
    onclick: function(e) {
      window.location = $('#photos h2 a')[0].href
    }
  }
  
  $(document).ready(function() {
    photos_splash.start()
    $('#photos').click(photos_splash.onclick)
  })
  
  $(window).resize(function() {
    if (container != null) {
      var pos = $('#photos .inner').position();
      container.css('left', (pos.left + 5) + "px");
      container.css('top', (pos.top - 15) + "px");
    }
  })
})();