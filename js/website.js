// Add movieNUMBER.jpg and bannerNUMBER.jpg to /img/ 
// And just add the title at the end of movieTitles variable. 
// The web app will load last ones first , ie movie5.jpg will come above movie4.jpg
// You can also delete any image but continue adding latest movies at the end, the app will take care of it.

var movieTitles = new Array('Besharam','Chennai Express','Bhaag Milkha Bhaag','Dhoom 3','Raam Leela','Golmaal','Krrish 3','R... Rajkumar','Hasee Toh Phasee','Yeh Jawaani Hai Deewani','Aashiqui 2','Jai Ho');
var bannerLoadingImage = 'http://bradsknutson.com/wp-content/uploads/2013/04/page-loader.gif';
var pieChartLoadingImage = 'http://interrail2012.manticus.info/wp-content/plugins/skydrive-slideshow/images/loading_anime.gif';
var votedMovies = {};
$(document).ready(function() {
     // Load movies
     $("#banner").prepend("<img id='loadingImage' height=250 src='"+bannerLoadingImage+"'>");
     for(var i = movieTitles.length;i > 0 ;i--) {
          if(urlExists('img/movie'+i+'.jpg'))
               $('#movie-cards').append('<div class="movieCard"><img src="img/movie'+i+'.jpg"></div>');     
     }
     // Pull sidebar details
     $("#movie-cards").scrollTop(0);
     // Add arrow 
     $(".movieCard").append("<div class='arrow'></div>");
     // Initiate the selection
     $(".movieCard").first().addClass("selectedMovie");
     $('#loadingImage').remove();
     updateContent();
     updateDetails();
     
     $("#sidebar #movie-cards .movieCard").click(function (){
          $(".selectedMovie").removeClass("selectedMovie");
          $(this).addClass("selectedMovie");
          updateContent();
          updateDetails();
     });
});

/********* 
   SCROLL
*********/

$(document).keydown(function(e){
     if(e.keyCode == 38) { // up
          scrollUp();
     } else if (e.keyCode == 40) { // down
          scrollDown();
     }
     if(e.keyCode == 37 || e.keyCode == 39) { // left || right
          loadDetails();
     }
});
function scrollDown() {
     if($(".movieCard").last().is(".selectedMovie")) {
          $("#movie-cards").animate({scrollTop : 0},200);
          $(".movieCard").last().removeClass("selectedMovie");
          $(".movieCard").first().addClass("selectedMovie");

     } else { 
          $("#movie-cards").animate({scrollTop : $("#movie-cards").scrollTop()+$(".selectedMovie").outerHeight()},200);
          $(".selectedMovie").next().addClass("selectedMovie");
          $(".selectedMovie").first().removeClass("selectedMovie");
     }
     updateContent();
     updateDetails();
}
function scrollUp() {
     if($(".movieCard").first().is(".selectedMovie")) {
          $("#movie-cards").animate({scrollTop : document.getElementById("movie-cards").scrollHeight},200);
          $(".movieCard").first().removeClass("selectedMovie");
          $(".movieCard").last().addClass("selectedMovie");
     } else {
          $("#movie-cards").animate({scrollTop : $("#movie-cards").scrollTop()-$(".selectedMovie").outerHeight()},200);
          $(".selectedMovie").prev().addClass("selectedMovie");
          $(".selectedMovie").last().removeClass("selectedMovie");
     }
     updateContent();
     updateDetails();
}

/********* 
   UPDATE
*********/
function updateContent() {
     var movieDetails = getFilmDetails(new String($(".selectedMovie img").attr("src")));
     $("#banner-image").hide(0,function () {
          if(!document.getElementById('loadingImage'))
               $("#banner").prepend("<img id='loadingImage' height=250 src='"+bannerLoadingImage+"'>");
          else 
               $('#loadingImage').remove();
          $("#banner-image").attr("src",movieDetails['bannerImageSource']);
     });
     $("#banner-image").load(function () {
          $("#banner #loadingImage").remove();
          $("#banner-image").fadeIn("slow");
     });   
     $("#banner-description").html('<h3>'+movieDetails['title']+'</h3>');
     getTweets(movieDetails['title'],'top'); 
}
function updateDetails() {
     setChartData(getFilmDetails(new String($(".selectedMovie img").attr("src")))['title'],'tweets'); 
     setBuzzingWords(); 
     getVotes();
}

/********* 
   MAIN
*********/
function getTweets(name,type) {
     $("#top-tweets .topTweet").each(function () {
          $(this).remove(); 
     });
     $("#top-tweets h3").remove();
     $(".analyticsItem span").html("<img height=40 src='"+pieChartLoadingImage+"'>");
     $.ajax({ 
          dataType : "json",
          url : "http://api.frrole.com/v1/topic/?q="+encodeURIComponent(name)+"&apikey=ImZY7qf4txI2A8nZv0mf5284afed8a42c",
          success : function(data) {
                               $(".analyticsItem span img").remove();
                              if(data.status == "ok" && data.remainingquota > 0) {
                                   showTweets(data.results,type);
                              } else
                                   console.log("API Status not ok. Remaining Quota : "+data.remainingquota);
                         },
          error : function() {
                         console.log("Couldn't connect to API");
                    }
     });
}
function showTweets(tweets,type) {
     // Analytics
     $("#total-tweets span").html(tweets.count?tweets.count:'-');
     $("#fans-sentiment span").html(tweets.total_pos_sentiment?'<input class="knob" value="'+(Math.floor(tweets.total_pos_sentiment*10)/10)+'" data-readonly="true" data-thickness=".4" readonly="readonly" data-width="100" data-height="100" data-angleOffset=180 data-fgColor="#87AB66" data-bgColor="#E1EAD9">':'-');
     $("#critics-sentiment span").html(tweets.total_neg_sentiment?'<input class="knob" value="'+((-1)*Math.floor(tweets.total_neg_sentiment*10)/10)+'" data-readonly="true" data-thickness=".4" readonly="readonly" data-width="100" data-angleOffset=180 data-height="100"  data-fgColor="#D94D4D" data-bgColor="#F5D2D2" >':'-');     
     loadKnob();
     switch(type) {
          case 'top' :
               var reLink = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/ ;
               if(jQuery.isEmptyObject(tweets.top_tweets))
                    $("#top-tweets").append("<h3>No tweets</h3>");
               else {
                    for(i = 0;i < tweets.count;i++) {
                         var t = tweets.top_tweets[i];
                         var ts = new String(tweets.top_tweets[i].timestamp);
                         var d = new Date(ts);
                         var m = new Array("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sept","Oct","Nov","Dec");
                         var date = d.getDate()+' '+m[d.getMonth()];
                         $("#top-tweets").append('<div class="topTweet"><div class="twHeader"><img class="tweeterImage" src="'+t.user_image+'"><div class="tweeterName">'+t.username+'<a href="http://twitter.com/'+t.display_name+'" target="_blank">@'+t.display_name+'</a></div></div><div class="tweetContent">'+t.text.replace(reLink,"<a href='$&'>$&</a>")+'</div><span class="tweetTime"><a href="https://twitter.com/'+t.username+'/status/'+t.tweet_id+'/" target="_blank">'+date+'</a></span><span class="webIntents"><a href="javascript:shareonTwitter(\''+t.username+'\',\''+encodeURIComponent(t.text)+'\',\''+t.tweet_id+'\',\'Reply\',\'550\', \'420\')"><img src="img/reply.gif"></a><a href="javascript:shareonTwitter(\''+t.username+'\',\''+encodeURIComponent(t.text)+'\',\''+t.tweet_id+'\',\'Favorite\',\'550\', \'420\')"><img src="img/fav.gif"></a><a href="javascript:shareonTwitter(\''+t.username+'\',\''+encodeURIComponent(t.text)+'\',\''+t.tweet_id+'\',\'Retweet\',\'550\', \'420\')"><img src="img/rt.gif"></a></span></div>');
                    }
              }
              break;
          case 'neg' :
               var reLink = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/ ;
               if(jQuery.isEmptyObject(tweets.negative_tweets))
                    $("#top-tweets").append("<h3>No tweets</h3>");
               else {
                    for(i = 0;i < tweets.count;i++) {
                         var t = tweets.negative_tweets[i];
                         var ts = new String(tweets.negative_tweets[i].timestamp);
                         var d = new Date(ts);
                         var m = new Array("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sept","Oct","Nov","Dec");
                         var date = d.getDate()+' '+m[d.getMonth()];
                         $("#top-tweets").append('<div class="topTweet"><div class="twHeader"><img class="tweeterImage" src="'+t.user_image+'"><div class="tweeterName">'+t.username+'<a href="http://twitter.com/'+t.display_name+'" target="_blank">@'+t.display_name+'</a></div></div><div class="tweetContent">'+t.text.replace(reLink,"<a href='$&'>$&</a>")+'</div><span class="tweetTime"><a href="https://twitter.com/'+t.username+'/status/'+t.tweet_id+'/" target="_blank">'+date+'</a></span><span class="webIntents"><a href="javascript:shareonTwitter(\''+t.username+'\',\''+encodeURIComponent(t.text)+'\',\''+t.tweet_id+'\',\'Reply\',\'550\', \'420\')"><img src="img/reply.gif"></a><a href="javascript:shareonTwitter(\''+t.username+'\',\''+encodeURIComponent(t.text)+'\',\''+t.tweet_id+'\',\'Favorite\',\'550\', \'420\')"><img src="img/fav.gif"></a><a href="javascript:shareonTwitter(\''+t.username+'\',\''+encodeURIComponent(t.text)+'\',\''+t.tweet_id+'\',\'Retweet\',\'550\', \'420\')"><img src="img/rt.gif"></a></span></div>');
                    }
              }
              break;
          case 'pos' :
               var reLink = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/ ;
               if(jQuery.isEmptyObject(tweets.positive_tweets))
                    $("#top-tweets").append("<h3>No tweets</h3>");
               else {
                    for(i = 0;i < tweets.count;i++) {
                         var t = tweets.positive_tweets[i];
                         var ts = new String(tweets.positive_tweets[i].timestamp);
                         var d = new Date(ts);
                         var m = new Array("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sept","Oct","Nov","Dec");
                         var date = d.getDate()+' '+m[d.getMonth()];
                         $("#top-tweets").append('<div class="topTweet"><div class="twHeader"><img class="tweeterImage" src="'+t.user_image+'"><div class="tweeterName">'+t.username+'<a href="http://twitter.com/'+t.display_name+'" target="_blank">@'+t.display_name+'</a></div></div><div class="tweetContent">'+t.text.replace(reLink,"<a href='$&'>$&</a>")+'</div><span class="tweetTime"><a href="https://twitter.com/'+t.username+'/status/'+t.tweet_id+'/" target="_blank">'+date+'</a></span><span class="webIntents"><a href="javascript:shareonTwitter(\''+t.username+'\',\''+encodeURIComponent(t.text)+'\',\''+t.tweet_id+'\',\'Reply\',\'550\', \'420\')"><img src="img/reply.gif"></a><a href="javascript:shareonTwitter(\''+t.username+'\',\''+encodeURIComponent(t.text)+'\',\''+t.tweet_id+'\',\'Favorite\',\'550\', \'420\')"><img src="img/fav.gif"></a><a href="javascript:shareonTwitter(\''+t.username+'\',\''+encodeURIComponent(t.text)+'\',\''+t.tweet_id+'\',\'Retweet\',\'550\', \'420\')"><img src="img/rt.gif"></a></span></div>');
                    }
              }
              break;
    }
}

/***************
    DETAILS
***************/
function loadDetails() {
     if($("#details-wrapper").css("display") == "none") {     
          $("#main-wrapper").addClass("boxRotate");
          setTimeout(function () { 
               $("#main-wrapper").removeClass("boxRotate");
               $("#main-wrapper").hide(0);
               $("#details-wrapper").show(0);
               $("#details-wrapper").addClass("boxRotateOp");
          },350);
          setTimeout(function () { 
               $("#details-wrapper").removeClass("boxRotateOp");
         },500);    
     } else {
          $("#details-wrapper").addClass("boxRotate");
          setTimeout(function () { 
               $("#details-wrapper").removeClass("boxRotate");
               $("#details-wrapper").hide(0);
               $("#main-wrapper").show(0);
               $("#main-wrapper").addClass("boxRotateOp");
          },350);
          setTimeout(function () { 
               $("#main-wrapper").removeClass("boxRotateOp");
          },500);
     }
}
function setBuzzingWords() {
     $("#buzzing div:not(.detailedHeader)").html("<img width='50%' src="+bannerLoadingImage+">");
     $.ajax({ 
          dataType : "json",
          async : "false",
          url : "http://api.frrole.com/v1/topics/",
          data : {apikey : 'ImZY7qf4txI2A8nZv0mf5284afed8a42c',location : 'india',category : 'entertainment'},
          success : function(data) {
               $("#buzzing div:not(.detailedHeader)").html('');
               var d = data.results.slice(0,10);
               $.each(d, function( i, v ) {
                    if( i < 10)
                    $("#buzzing div:not(.detailedHeader)").append('<span class="buzzingWord" style="font-size:'+(14+(.15)*v.unique_tweets)+'px;">'+v.entity+'</span>');
               });
          },                
          error : function() {
                         console.log("Couldn't connect to API");
                    }
     });
}

/************
   HELPERS
************/
function shareonTwitter(tempuname,temptweettxt,temptweetid,title,w,h) {
     var left = (screen.width/2)-(w/2);
     var top = (screen.height/2)-(h/2);
     var retweetText=''; 
     var pageURL ='';
     
     if(title=='TweetShare'){
     pageURL = "https://twitter.com/intent/tweet?original_referer="+encodeURIComponent(SITEINDEX)+"&source=tweetbutton&text="+encodeURIComponent("RT @"+tempuname+": ")+temptweettxt;

          if(Math.abs(tempuname.length)+Math.abs(temptweettxt.length)<=122) 
               pageURL +="&via=frrole";
          else if(Math.abs(tempuname.length)+Math.abs(temptweettxt.length)>140) 
               pageURL ="https://twitter.com/intent/retweet?tweet_id="+temptweetid;
     } else if (title=='Reply'){
          pageURL ="https://twitter.com/intent/tweet?in_reply_to="+temptweetid;
     } else if (title=='Retweet'){
          pageURL ="https://twitter.com/intent/retweet?tweet_id="+temptweetid;
     } else if (title=='Favorite'){
          pageURL ="https://twitter.com/intent/favorite?tweet_id="+temptweetid;
     }
     var targetWin = window.open (pageURL, title, 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width='+w+', height='+h+', top='+top+', left='+left);
}
function getFilmDetails(imageSource) {
     var details = {};
     var imageNumber = new String(imageSource.match(/[0-9]+/));
     details['id'] = imageNumber;
     details['bannerImageSource'] = 'img/banner'+imageNumber+'.jpg';
     details['title'] = movieTitles[imageNumber-1];
     return details;
}
function urlExists(url)
{
    var http = new XMLHttpRequest();
    http.open('HEAD', url, false);
    http.send();
    return http.status!=404;
}

/**************
    GRAPH
**************/
function setChartData(q,type) {
     if(type == 'sentiment') {
          $("#graph-button").addClass("boxRotate");
          setTimeout(function () { 
               $("#graph-button").removeClass("boxRotate");
               $("#graph-button").hide(0);
               $('#graph-button').html('Sentiment');
               $("#graph-button").show(0);
               $("#graph-button").addClass("boxRotateOp");
          },350);
          setTimeout(function () { 
               $("#graph-button").removeClass("boxRotateOp");
               $('#graph-button').attr('onclick',"setChartData(getFilmDetails(new String($('.selectedMovie img').attr('src')))['title'],'tweets');");
         },500);    
     } else {
          $("#graph-button").addClass("boxRotate");
          setTimeout(function () { 
               $("#graph-button").removeClass("boxRotate");
               $("#graph-button").hide(0);
               $('#graph-button').html('Tweets');
               $("#graph-button").show(0);
               $("#graph-button").addClass("boxRotateOp");
          },350);
          setTimeout(function () { 
               $("#graph-button").removeClass("boxRotateOp");
               $('#graph-button').attr('onclick',"setChartData(getFilmDetails(new String($('.selectedMovie img').attr('src')))['title'],'sentiment');");
         },500);    
     }
     $('#chart').html('<img width="20%" src="'+bannerLoadingImage+'">');
     $.ajax({ 
          dataType : "json",
          async : "false",
          url : "http://api.frrole.com/v1/interval-data",
          data : {apikey : 'ImZY7qf4txI2A8nZv0mf5284afed8a42c',query : q,equivalence : 'True',sentiment : 'True' ,interval : 'day',intervaltype : 'time'},
          success : function(data) {
               generateChart(q,data.results.data.distribution_data,type);
          },                
          error : function() {
                         console.log("Couldn't connect to API");
                    }
     });  
}
function generateChart(q,d,type) {
     $('#chart').html('');
     var tA = new Array();
     var nA = new Array();
     var posA = new Array();
     var negA = new Array();
     $.each(d,function(i,v) {
          var da = new Date(new String(i));
          var m = new Array("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sept","Oct","Nov","Dec");
          var date = da.getDate()+' '+m[da.getMonth()];
          tA = tA.concat(date);
          nA = nA.concat(v.n);
          negA = negA.concat(-1*v.negative_sentiment);
          posA = posA.concat(v.positive_sentiment);
     });
               console.log(negA);
          console.log(posA);
     if(type == 'tweets') {
          $('#chart').highcharts({ 
               title: { text: q+' Analysis', x: -20}, 
               subtitle: { text: '', x: -20 }, 
               xAxis: {  gridLineWidth :0, categories: tA},
               yAxis: {
                    gridLineWidth :0,
                    title: { text: 'Number' }
               }, 
               tooltip: { valueSuffix: ' Count' },
               legend: { layout: 'vertical',align: 'right',verticalAlign: 'middle',borderWidth: 0 },
               series: [{ name: 'Tweets', data: nA ,color: '#D10057'}] 
          });
   } else if(type == 'sentiment') {
          $('#chart').highcharts({
               title: {text: q+' Analysis',x: -20},
               subtitle: {text: '',x: -20},
               xAxis: {gridLineWidth :0,categories: tA},
               plotOptions: {series: {color: '#D10057'}},
               yAxis: {
                    gridLineWidth :0,
                    title: {text: 'Percentage'},
               },
               tooltip: {valueSuffix: '%'},
               legend: {layout: 'vertical',align: 'right',verticalAlign: 'middle',borderWidth: 0},
               series: [{name: 'Fan Sentiment',data: posA,color: '#D10057'}, {name: 'Critic Sentiment',data: negA,color: '#D10057'}]
          });
     }
}
function setVote(oid) {
     var movieID = getFilmDetails(new String($(".selectedMovie img").attr("src")))['id'];
     var movieTitle = getFilmDetails(new String($(".selectedMovie img").attr("src")))['title'];
     var isVoted = votedMovies[movieTitle]?1:0;
     if(isVoted) 
          return;
     $('.pollOption[onclick="setVote('+oid+')"] div').html(parseInt($('.pollOption[onclick="setVote('+oid+')"] div').html())+1); 
     $('.pollOption[onclick="setVote('+oid+')"]').css('font-weight','800');
     votedMovies[movieTitle] = oid;
     $.ajax ({
          url : 'votes.php',
          type : 'post',
          data : {r:'s',d:{id:movieID,oid:oid}},
          dataType : 'json',
          success : function(d) {
               console.log(d);
          },
          error : function() {
               console.log('error in getting xml');
          }
     });
}
function getVotes() {
     var movieID = getFilmDetails(new String($(".selectedMovie img").attr("src")))['id'];
     var movieTitle = getFilmDetails(new String($(".selectedMovie img").attr("src")))['title'];
     $('#poll-content').hide(0);
     $('#poll').append('<img id="limg" width="50%" src="'+bannerLoadingImage+'">');
     $.ajax ({
          url : 'votes.php',
          type : 'post',
          data : {r:'g',d:{id:movieID}},
          dataType : 'json',
          success : function(d) {
               d = d.m;
               $('#poll #limg').remove();
               $('#poll-content').show(0);
               $('#poll-question').html(d.poll);
               document.getElementsByClassName('pollOption')[0].innerHTML = '<img src="'+d.option1.image+'"><span>'+d.option1.title + '</span><div>'+d.option1.votes+'</div>';
               document.getElementsByClassName('pollOption')[1].innerHTML = '<img src="'+d.option2.image+'"><span>' + d.option2.title + '</span><div>'+d.option2.votes+'</div>';
               document.getElementsByClassName('pollOption')[2].innerHTML = '<img src="'+d.option3.image+'"><span>' +d.option3.title + '</span><div>'+d.option3.votes+'</div>';
               document.getElementsByClassName('pollOption')[3].innerHTML = '<img src="'+d.option4.image+'"><span>' +d.option4.title + '</span><div>'+d.option4.votes+'</div>';
          },
          error : function() {
               console.log('error in getting xml');
          }
     });
     $.each(document.getElementsByClassName('pollOption'),function(a,v) {
          v.style.fontWeight = '400';
          if(votedMovies[movieTitle] && v.getAttribute("onclick") == 'setVote('+votedMovies[movieTitle]+')') {
               v.style.fontWeight = '800';
               console.log(v.style.fontWeight + ' ; ' +v.getAttribute("onclick") + ' : ' + 'setVote('+votedMovies[movieTitle]+')');
          }
     });
}