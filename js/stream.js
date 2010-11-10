var stream = (function(){
    function Activity(args) {
        this.title = args.title
        this.body = args.body
        this.timestamp = args.timestamp
        this.url = args.url
    }
    
    function pad(val, len) {
        val = String(val);
        len = len || 2;
        while (val.length < len) val = "0" + val;
        return val;
    };
    
    function escapeHTML(text) {
        return $('<div/>').text(text).html()
    }
    
    function short_date(date) {
        return (date.getHours() % 12 || 12) + ":" + pad(date.getMinutes()) + (date.getHours() < 12 ? "am" : "pm")
    }
    
    function ordi(n){
        var s='th';
        if (n===1 || n==21 || n==31) s='st';
        if (n===2 || n==22) s='nd';
        if (n===3 || n==23) s='rd';
        return n+s;
    }
    
    var month_list = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    function long_date(date) {
        var s = date.toDateString()
        return (date.getHours() % 12 || 12) + ":" + pad(date.getMinutes()) + (date.getHours() < 12 ? " AM " : " PM ") + month_list[date.getMonth()] + " " + ordi(date.getDate())
    }
    
    function add_stream(activity) {
        // console.log(activity)
        var ts = activity.timestamp.getTime();
        var body = "<br />";
        if (activity.body) {
            body = "<p>" + activity.body + "</p>"
        }
        var item = "<li ts='"+activity.timestamp.getTime()+"' class='service-icon service-"+activity.service+"'>"+activity.title+body+"<a class='time' href='"+activity.url+"'>"+long_date(activity.timestamp)+"</a></li>";
        var found = false;
        $("#stream_list .service-icon").each(function(i, e) {
            e = $(e)
            if (ts > e.attr('ts')) {
                e.before(item)
                found = true;
                return false;
            }
        })
        
        if (!found) {
            $("#stream_list").append(item)
        }
    }
    
    var github = {
        parsers: {
            CommitCommentEvent: function(entry) {
                var repo = entry.repository.owner + "/" + entry.repository.name
                return new Activity({"title": "commented on a commit in <a href='"+entry.repository.url+"'>"+repo+"",
                    "url": entry.repository.url + "/commit/" + entry.payload.commit + "#commitcomment-" + entry.payload.comment_id
                })
            },
            PushEvent: function(entry) {
                var shas_to_show = entry.payload.shas
                var body = ""
                if (entry.payload.shas.length > 3) {
                    shas_to_show = entry.payload.shas.slice(0, 3)
                    var count = entry.payload.shas.length - shas_to_show.length
                    body = "<br /><a href='"+entry.url+"'>"+count+" more "+(count==1?'commit':'commits')+" »</a>"
                }
                body = ($.map(shas_to_show, function(e) {
                            var gravatar = "<span title='"+escapeHTML(e[3])+"'><img class='textimage' src='http://www.gravatar.com/avatar/"+hex_md5(e[1])+"?s=16&amp;d=http%3A%2F%2Fgithub.com%2Fimages%2Fgravatars%2Fgravatar-140.png' alt=''></span>"
                            return gravatar + " <a href='"+entry.repository.url+"/commit/"+e[0]+"'><code>" + e[0].substring(0,7) + "</code></a> " + escapeHTML(e[2])
                        })).join("<br />") + body
                
                return new Activity({"title": "pushed to "+entry.payload.ref.substring(entry.payload.ref.lastIndexOf('/')+1)+" at <a href='"+entry.repository.url+"'>"+entry.repository.owner+"/"+entry.repository.name+"</a>",
                                     "body": body})
            },
            ForkEvent: function(entry) {
                return new Activity({"title": "forked <a href='"+entry.repository.url+"'>"+entry.repository.owner+"/"+entry.repository.name+"</a>"})
            },
            WatchEvent: function(entry) {
                return new Activity({"title": "started watching <a href='"+entry.repository.url+"'>"+entry.repository.owner+"/"+entry.repository.name+"</a>"})
            },
            CreateEvent: function(entry) {
                if (entry.payload.object == "tag") {
                    return new Activity({"title": "created tag " + entry.payload.object_name + " at <a href='"+entry.repository.url+"'>"+entry.repository.owner+"/"+entry.repository.name+"</a>"})
                } else if (entry.payload.object == "branch") {
                    return new Activity({"title": "created branch " + entry.payload.object_name + " at <a href='"+entry.repository.url+"'>"+entry.repository.owner+"/"+entry.repository.name+"</a>"})
                } else if (entry.payload.object == "repository") {
                    return new Activity({"title": "created repository <a href='"+entry.repository.url+"'>"+entry.repository.name+"</a>"})
                }
            },
            MemberEvent: function(entry) {
                if (entry.payload.action == "added") {
                    return new Activity({"title": "added a member to <a href='"+entry.repository.url+"'>"+entry.repository.owner+"/"+entry.repository.name+"</a>"})
                }
            },
            IssuesEvent: function(entry) {
                if (entry.payload.action == "opened") {
                    return new Activity({"title": "opened <a href='"+entry.url+"'>issue "+entry.payload.issue+"</a> on <a href='"+entry.repository.url+"'>"+entry.repository.owner+"/"+entry.repository.name+"</a>"})
                }
            },
            GistEvent: function(entry) {
                if (entry.payload.action == "update") {
                    return new Activity({"title": "updated <a href='"+entry.payload.url+"'>"+escapeHTML(entry.payload.name)+"</a>", "url": entry.payload.url, "body": "<pre>"+escapeHTML(entry.payload.snippet)+"</pre>"})
                }
            },
            PullRequestEvent: function(entry) {
                if (entry.payload.action == "opened") {
                    return new Activity({title: "opened <a href='"+entry.url+"'>Pull Request "+entry.payload.number+"</a> on <a href='"+entry.repository.url+"'>"+entry.repository.owner+"/"+entry.repository.name+"</a>", url: entry.url})
                }
            },
            DeleteEvent: function(entry) {
                if (entry.payload.ref_type == "branch") {
                    return new Activity({title: "deleted branch "+entry.payload.ref+" at <a href='"+entry.repository.url+"'>"+entry.repository.owner+"/"+entry.repository.name+"</a>", url: entry.repository.url})
                } else if (entry.payload.ref_type == "tag") {
                    return new Activity({title: "deleted tag "+entry.payload.ref+" at <a href='"+entry.repository.url+"'>"+entry.repository.owner+"/"+entry.repository.name+"</a>", url: entry.repository.url})
                }
            }
        },
    
        fetch: function(username) {
            $.getJSON("http://github.com/"+username+".json?callback=?", function(data) {
                $.each(data, function(i,entry) {
                    console.log(entry)
                    try {
                      parser = github.parsers[entry.type]
                      if (parser) {
                          result = parser(entry)
                          if (result) {
                              result.service = "github"
                              result.timestamp = new Date(entry.created_at)
                              result.url = result.url || entry.url || "http://github.com/"+username
                              add_stream(result)
                          } else {
                              console.warn("unknown activity", entry)
                          }
                      } else {
                          console.warn("unknown activity", entry)
                      }
                    } catch(err) {
                      console.error(err);
                    }
                })
            })
        }
    }
    
    var twitter = {
        linkify_entities: function(tweet) {
            if (!(tweet.entities)) {
                return escapeHTML(tweet.text)
            }

            // This is very naive, should find a better way to parse this
            var index_map = {}

            $.each(tweet.entities.urls, function(i,entry) {
                index_map[entry.indices[0]] = [entry.indices[1], function(text) {return "<a href='"+escapeHTML(entry.url)+"'>"+escapeHTML(text)+"</a>"}]
            })

            $.each(tweet.entities.hashtags, function(i,entry) {
                index_map[entry.indices[0]] = [entry.indices[1], function(text) {return "<a href='http://twitter.com/search?q="+escape("#"+entry.text)+"'>"+escapeHTML(text)+"</a>"}]
            })

            $.each(tweet.entities.user_mentions, function(i,entry) {
                index_map[entry.indices[0]] = [entry.indices[1], function(text) {return "<a title='"+escapeHTML(entry.name)+"' href='http://twitter.com/"+escapeHTML(entry.screen_name)+"'>@"+escapeHTML(entry.screen_name)+"</a>"}]
            })

            var result = ""
            var last_i = 0
            var i = 0

            // iterate through the string looking for matches in the index_map
            for (i=0; i < tweet.text.length; ++i) {
                var ind = index_map[i]
                if (ind) {
                    var end = ind[0]
                    var func = ind[1]
                    if (i > last_i) {
                        result += escapeHTML(tweet.text.substring(last_i, i))
                    }
                    result += func(tweet.text.substring(i, end))
                    i = end - 1
                    last_i = end
                }
            }

            if (i > last_i) {
                result += escapeHTML(tweet.text.substring(last_i, i))
            }

            return result
        },
        
        find_thumbnails: function(tweet) {
            if (!(tweet.entities)) {
                return null
            }
            
            result = ""
            
            $.each(tweet.entities.urls, function(i,entry) {
                var match = /^http:\/\/yfrog.com\/([A-Za-z0-9]+)$/.exec(entry.url)
                if (match) {
                    result += "<a href='"+entry.url+"'><img src='http://yfrog.com/"+match[1]+".th.jpg' /></a> "
                }
                match = /^http:\/\/flic.kr\/p\/([A-Za-z0-9]+)$/.exec(entry.url)
                if (match) {
                    result += "<a href='"+entry.url+"'><img src='http://flic.kr/p/img/"+match[1]+"_t.jpg' /></a> "
                }
            })
            
            return (result != "" ? result : null)
        },
        
        fetch: function(username) {
            $.getJSON("http://api.twitter.com/1/statuses/user_timeline/"+username+".json?include_entities=true&count=42&callback=?", function(data) {
                $.each(data, function(i,entry) {
                    // console.log(entry)
                    result = new Activity({
                        "timestamp": new Date(entry.created_at),
                        "url": "http://twitter.com/"+entry.user.screen_name+"/status/"+entry.id,
                        "title": stream.twitter.linkify_entities(entry),
                        "body": stream.twitter.find_thumbnails(entry)
                    })
                    result.service = "twitter"
                    add_stream(result)
                })
            })
        }
    }
    
    return {
        github: github,
        twitter: twitter
    }
})();
