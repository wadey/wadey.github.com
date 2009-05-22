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
  var offsetX = 4;
  var offsetY = -15;
  window.code_splash = {
    start: function() {
      var block = $('#code');
      div = block.find('.inner');
      var pos = div.position();
      div.prepend("<div class='bits'></div>");
      div2 = div.find('.bits');
      
      //prep
      for (maxBits = 0; div2.height() < 130; ++maxBits) {
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
})();

(function(){
  var container;
  var offsetX = 5;
  var offsetY = -14;
  window.photos_splash = {
    start: function() {
      $.getJSON("http://api.flickr.com/services/feeds/photos_public.gne?id=41964757%40N00&format=json&jsoncallback=?", function(data) {
        photos_splash.data_loaded(data);
      })
    },
    
    data_loaded: function(photos_data) {
      var pos = $('#photos .inner').position()
      
      container = $('#photos .container')
      //container.css('left', (pos.left + offsetX) + "px")
      //container.css('top', (pos.top + offsetY) + "px")
      
      $.each(photos_data.items, function(i,item){
        var media_s = item.media.m.replace(/_m.jpg$/, '_s.jpg')
        //$('#photos').prepend("<img src='"+media_s+"' class='ft' style='left:"+x+"px;top:"+y+"px' /> ")
        container.prepend("<img src='"+media_s+"' class='ft' /> ")
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
      container.css('left', (pos.left + offsetX) + "px");
      container.css('top', (pos.top + offsetY) + "px");
    }
  })
})();