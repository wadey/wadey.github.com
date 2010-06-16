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
        $("#stream_list").append("<li class='service-icon service-"+activity.service+"'>"+activity.title+" <br /><a class='time' href='"+activity.url+"'>"+long_date(activity.timestamp)+"</a></li>")
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
                return new Activity({"title": "pushed to " + entry.repository.url})
            },
            ForkEvent: function(entry) {
                return new Activity({"title": "forked " + entry.repository.url})
            },
            FollowEvent: function(entry) {
                return new Activity({"title": "started following " + entry.payload.target})
            },
            CreateEvent: function(entry) {
                if (entry.payload.object == "tag") {
                    return new Activity({"title": "created tag " + entry.payload.object_name + " at " + entry.repository.url})
                }
            },
            WatchEvent: function(entry) {
                if (entry.payload.action == "started") {
                    return new Activity({"title": "started watching " + entry.repository.url})
                }
            },
            MemberEvent: function(entry) {
                if (entry.payload.action == "added") {
                    return new Activity({"title": "added a member to " + entry.repository.url})
                }
            }
        },
    
        fetch: function(username) {
            $.getJSON("http://github.com/"+username+".json?callback=?", function(data) {
                $.each(data, function(i,entry) {
                    parser = github.parsers[entry.type]
                    if (parser) {
                        result = parser(entry)
                        if (result) {
                            result.service = "github"
                            result.timestamp = new Date(entry.created_at)
                            result.url = result.url || "http://github.com/"+username
                            add_stream(result)
                        } else {
                            console.warn("unknown activity", entry)
                        }
                    } else {
                        console.warn("unknown activity", entry)
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
                index_map[entry.indices[0]] = [entry.indices[1], function(text) {return "<a title='"+escapeHTML(entry.name)+"' href='http://twitter.com/"+escapeHTML(entry.screen_name)+"'>"+escapeHTML(text)+"</a>"}]
            })
            
            var result = ""
            var last_i = 0
            var i = 0
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
        
        fetch: function(username) {
            $.getJSON("http://api.twitter.com/1/statuses/user_timeline/"+username+".json?include_entities=true&callback=?", function(data) {
                $.each(data, function(i,entry) {
                    console.log(entry)
                    result = new Activity({
                        "timestamp": new Date(entry.created_at),
                        "url": "http://twitter.com/"+entry.user.screen_name+"/status/"+entry.id,
                        "title": stream.twitter.linkify_entities(entry)
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