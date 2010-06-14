(function(){  
  window.flickr = {
    key: "4accf43733400fcf7055484dad423e97",
    
    photos: {
      getExif: function(photoId, callback) {
        flickr.call("flickr.photos.getExif", {photo_id: photoId}, function(data) {
          callback(flickr.parseExif(data.photo));
        });
      },
      getInfo: function(photoId, callback) {
        flickr.call("flickr.photos.getInfo", {photo_id: photoId}, function(data) { callback(data.photo) });
      },
      search: function(params, callback) {
        flickr.call("flickr.photos.search", params, function(data) {
          callback(data.photos);
        })
      }
    },
    
    parseExif: function(photo) {
      var exif = {
        data: {},
        
        pretty: function(tagspace, tag) {
          var e = this.data[tagspace][tag]
          return e.clean || e.raw;
        },
        
        raw: function(tagspace, tag) {
          return this.data[tagspace][tag].raw;
        },
        
        clean: function(tagspace, tag) {
          return this.data[tagspace][tag].clean;
        }
      };
      var index;
      var pretty = function() {
        return this.clean || this.raw;
      }
      
      for (index in photo.exif) {
        var element = photo.exif[index]
        if (exif.data[element.tagspace] === undefined) {
          exif.data[element.tagspace] = {}
        }
        
        var raw = element.raw && element.raw._content
        var clean = element.clean && element.clean._content
        exif.data[element.tagspace][element.tag] = {raw: raw, clean: clean, pretty: pretty}
      }
      return exif
    },
    
    smallImg: function(photo) {
      return flickr.buildImgUrl(photo.farm, photo.server, photo.id, photo.secret, "m");
    },
    
    mediumImg: function(photo) {
      return flickr.buildImgUrl(photo.farm, photo.server, photo.id, photo.secret);
    },
    
    largeImg: function(photo) {
      return flickr.buildImgUrl(photo.farm, photo.server, photo.id, photo.secret, "b");
    },
    
    buildImgUrl: function(farmId, serverId, id, secret, size) {
      if (size == undefined) {
        return "http://farm"+farmId+".static.flickr.com/"+serverId+"/"+id+"_"+secret+".jpg";
      }
      return "http://farm"+farmId+".static.flickr.com/"+serverId+"/"+id+"_"+secret+"_"+size+".jpg";
    },
    
    call: function(method, params, callback) {
      params.api_key = flickr.key;
      params.method = method;
      params.format = "json";
      
      params = $.param(params) + '&jsoncallback=?'
      
      $.get("http://api.flickr.com/services/rest/?" + params, function(data) {
        console.log(data);
        callback(data);
      }, 'json');
    }
  }
})();