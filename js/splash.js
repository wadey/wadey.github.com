(function(){
  var leftover = []
  window.photos_splash = {
    start: function() {
      $.getJSON("http://api.flickr.com/services/feeds/photos_public.gne?id=41964757%40N00&format=json&jsoncallback=?", function(data) {
        photos_splash.data_loaded(data);
      })
    },
    
    data_loaded: function(photos_data) {
      var container = $('#photothumbs')
      container.empty()
      
      var photos = leftover.concat(photos_data.items)
      
      if (photos.length > 18) {
        leftover = photos.slice(18)
        photos = photos.slice(0, 18)
      }
      
      $.each(photos, function(i,item){
        var media_s = item.media.m.replace(/_m.jpg$/, '_s.jpg')
        container.append("<a title='"+item.title+"' href='"+item.link+"'><img src='"+media_s+"' class='photothumb' /></a> ")
      })
    },
  }
  
  $(document).ready(function() {
    photos_splash.start()
  })
})();