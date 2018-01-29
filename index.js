const app = require('express')();// Low level communication helper like protocol
const http = require('http').Server(app);// Our Web Server
const request = require('request');
const io = require('socket.io')(http);// For Realtime communication between Server-Client
const cheerio = require('cheerio')
var fs = require('fs');



var WordList;
//Render our page with route
app.get('/', function (req, res) {
  res.sendfile('index.html');
})
app.get('/style.css', function (req, res) {
  res.sendfile('style.css');
})
app.get('/kelimesay', function (req, res) {
  res.sendfile('kelimesay.html');
})
app.get('/kelimesay.css', function (req, res) {
  res.sendfile('kelimesay.css');
})
app.get('/sayfadiz', function (req, res) {
  res.sendfile('sayfadiz.html');
})
app.get('/sayfadiz.css', function (req, res) {
  res.sendfile('sayfadiz.css');
})
app.get('/sitediz', function (req, res) {
  res.sendfile('sitediz.html');
})
app.get('/sitediz.css', function (req, res) {
  res.sendfile('sitediz.css');
})
app.get('/semantik', function (req, res) {
  res.sendfile('semantik.html');
})
app.get('/semantik.css', function (req, res) {
  res.sendfile('semantik.css');
})
app.get('/anasayfa.png', function (req, res) {
  res.sendfile('anasayfa.png');
})

fs.readFile('kelime-esanlamlisi.txt', function(err, data) {
    if(err) throw err;
    WordList = data.toString().split("\n");
    for(i in WordList) {
	     WordList[i] = WordList[i].split('\t');
       //console.log("Okunan: " + WordList[i][0] + " : " + WordList[i][1]);
    }
});


io.on('connection',function (socket) {

  socket.on('getPage', function (data) {

    try {
      WordCounter(data, function (data) {
        socket.emit('onprocess',true);

        //console.log(data.url);
        data.searchit = data.searchit.split(" ");
        //console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
        //console.log(data);

        socket.emit('onprocess',false);

        socket.emit('responsePage',data);
      });
    } catch (e) {
      console.log("Connection Error!");
      console.log(e);
      socket.emit('requestError',data);
    }
  })

  socket.on('getmultiPage', function (data) {
    try {
      socket.emit('onprocess',true);

      var urls = data.url.split(" ");
      console.log(urls);
      urls.forEach(function (listItem, callback) {
        socket.emit('onprocess',true);

        var minData = data;
        minData.url = listItem;
        WordCounter(minData, function (minData) {
          minData.url = listItem;
          //console.log(listItem);
          minData.searchit = minData.searchit.split(" ");
          //console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
          //console.log(minData);

          socket.emit('onprocess',false);

          socket.emit('responsePage',minData);
        });

      })

    } catch (e) {
      console.log("Connection Error!");
      console.log(e);
      socket.emit('requestError',data);
    }
  })

  var urlArray =[];

  socket.on('getmultiSite', function (data) {
    try {
      socket.emit('onprocess',true);

      var urls = data.url.split(" ");
      //console.log(urls);
      var responseData = [];
      var deep1 = [];
      var deep2 = [];

      responseData.push(deep1);
      responseData.push(deep2);
      var last = 0;

      urls.forEach(function (listItem, callback) {
        socket.emit('onprocess',true);

        var minData = data;
        minData.url = listItem;

        WordCounter(minData, function (minData) {
          socket.emit('onprocess',true);

          minData.url = listItem;
          responseData.push(minData);
          //console.log(listItem);
          //console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
          //console.log(minData);
          DeepCounter(minData, function (deepurl) {
            socket.emit('onprocess',true);

            var Submit = function submit() {
              console.log("Submit:");
              socket.emit('onprocess',false);

              socket.emit('responsePage', responseData);
              console.log(JSON.stringify(responseData));
              console.log(JSON.stringify(deep1));
              console.log(JSON.stringify(deep2));
            }

            try {

              try {
                last += deepurl.deepurls.length;
              } catch (e) {
                console.log(e);
                console.log("Last error!");
              }


              deepurl.deepurls.forEach(function (element, callback) {
                socket.emit('onprocess',true);

                deepData = {
                  url: element,
                  searchWord: deepurl.searchWord
                };
                try {
                  WordCounter(deepData, function (minDataDeep1) {
                    socket.emit('onprocess',true);

                    minDataDeep1.url = element;
                    minDataDeep1.parent = deepurl.url;
                    deep1.push(minDataDeep1);
                    //console.log("minDataDeep1:" + JSON.stringify(minDataDeep1));
                    /*console.log("\n\n\nresponseData: " + JSON.stringify(responseData));
                    console.log("\ndeep1: " + JSON.stringify(deep1));
                    console.log(data);*/

                    //console.log("Last: " + last);

                    last--;
                    //console.log(last);
                    if(last < 2)
                      Submit();
                    socket.emit('remainingResponse', last);
                  })
                } catch (e) {
                  console.log(e);
                  last--;
                  console.log("Last: " + last);
                }

              });

            } catch (e) {
              console.log(e);

            }

            //console.log(deepurl);
            //console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
            //console.log(minData);
            //socket.emit('responsePage',minData);
          })
        });

      })

    } catch (e) {
      console.log("Connection Error!");
      console.log(e);
      socket.emit('requestError',data);
    }
  })

  socket.on('getmultiSiteSemantic', function (data) {
    try {
      socket.emit('onprocess',true);

      var urls = data.url.split(" ");
      //console.log(urls);
      var responseData = [];
      var deep1 = [];
      var deep2 = [];

      responseData.push(deep1);
      responseData.push(deep2);
      var last = 0;

      urls.forEach(function (listItem, callback) {
        var minDat = data;
        minDat.url = listItem;

        socket.emit('onprocess',true);

        minDat.searchWord = minDat.searchWord.split(' ');
        Semantic(minDat,function (minData) {

          socket.emit('onprocess',true);

          WordCounter(minData, function (minData) {

            socket.emit('onprocess',true);

            minData.url = listItem;
            responseData.push(minData);
            //console.log(listItem);
            //console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
            //console.log(minData);
            DeepCounter(minData, function (deepurl) {

              socket.emit('onprocess',true);

              var Submit = function submit() {
                console.log("Submit:");

                socket.emit('onprocess', false);

                socket.emit('responsePage', responseData);
                console.log(JSON.stringify(responseData));
                console.log(JSON.stringify(deep1));
                console.log(JSON.stringify(deep2));
              }

              try {

                try {
                  last += deepurl.deepurls.length;
                } catch (e) {
                  console.log(e);
                  console.log("Last error!");
                }

                socket.emit('onprocess',true);

                deepurl.deepurls.forEach(function (element, callback) {
                  socket.emit('onprocess',true);
                  deepData = {
                    url: element,
                    searchWord: deepurl.searchWord
                  };
                  try {
                    WordCounter(deepData, function (minDataDeep1) {

                      socket.emit('onprocess',true);

                      minDataDeep1.url = element;
                      minDataDeep1.parent = deepurl.url;
                      deep1.push(minDataDeep1);
                      //console.log("minDataDeep1:" + JSON.stringify(minDataDeep1));
                      /*console.log("\n\n\nresponseData: " + JSON.stringify(responseData));
                      console.log("\ndeep1: " + JSON.stringify(deep1));
                      console.log(data);*/

                      //console.log("Last: " + last);

                      last--;
                      //console.log(last);
                      if(last < 2)
                        Submit();
                      socket.emit('remainingResponse', last);
                    })
                  } catch (e) {
                    console.log(e);
                    last--;
                    console.log("Last: " + last);
                  }

                });

              } catch (e) {
                console.log(e);

              }

              //console.log(deepurl);
              //console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
              //console.log(minData);
              //socket.emit('responsePage',minData);
            })
          });
        })



      })

    } catch (e) {
      console.log("Connection Error!");
      console.log(e);
      socket.emit('requestError',data);
    }
  })


  function Semantic(data, callback) {
    console.log(JSON.stringify(data));
    var words = data.searchWord;
    data.searchWord.forEach(function (element) {
      for (var i = 0; i < WordList.length; i++) {

        wordL = WordList[i][0].replace(/İ|I|Ü|U|Ş|Ğ|Ç|Ö|Â|Û|Î|ı|î|ğ|ü|ö|ç|â|û|ô|ş|i̇|î/gi, function (x){
          for(var k = 0; k < x.length; k++){
            if(x[k] == 'I') return 'i';
            if(x[k] == 'İ') return 'i';
            if(x[k] == 'Î') return 'i';
            switch(x[k].toLowerCase()){
              case 'î': return 'i';
              case 'i̇': return 'i';
              case 'ı': return 'i';
              case 'î': return 'i';
              case 'ğ': return 'g';
              case 'ü': return 'u';
              case 'ö': return 'o';
              case 'ç': return 'c';
              case 'â': return 'a';
              case 'û': return 'u';
              case 'ô': return 'o';
              case 'ş': return 's';
              default : return  x;
              }
          }
          return x;
        }).toLowerCase();
        elem = element.replace(/İ|I|Ü|U|Ş|Ğ|Ç|Ö|Â|Û|Î|ı|î|ğ|ü|ö|ç|â|û|ô|ş|i̇|î/gi, function (x){
          for(var k = 0; k < x.length; k++){
            if(x[k] == 'I') return 'i';
            if(x[k] == 'İ') return 'i';
            if(x[k] == 'Î') return 'i';
            switch(x[k].toLowerCase()){
              case 'î': return 'i';
              case 'i̇': return 'i';
              case 'ı': return 'i';
              case 'î': return 'i';
              case 'ğ': return 'g';
              case 'ü': return 'u';
              case 'ö': return 'o';
              case 'ç': return 'c';
              case 'â': return 'a';
              case 'û': return 'u';
              case 'ô': return 'o';
              case 'ş': return 's';
              default : return  x;
              }
          }
          return x;
        }).toLowerCase();

        if(wordL === elem){
          if(words.indexOf(WordList[i][1]) === -1){
            words.push(WordList[i][1]);
            break;
          }
        }

      }
    });
    data.searchWord = words.join(' ');
    console.log(JSON.stringify(data));
    return callback(data);
  }



  function DeepCounter(data, callback) {
    socket.emit('onprocess',true);

    searchit = data.searchit;

    request({uri: data.url}, function(err, response, html){
      var self = this;
       //console.log("DeepCounter self.uri.href → " + JSON.stringify(self.uri.href));

      try {
        if(err && response.statusCode !== 200){console.log('Request error.');}
        //console.log(body);
        //console.log(response);
          const $ = cheerio.load(html);
          var deepurl = [];
          $('html *').each(function(i, element){
               //var a = $(this);
               var a = $(this).prev();
               var rank = a.parent().parent().text();
               var title = a.text();
               var urldeep = a.attr('href');
               var subtext = a.parent().parent().next().children('.subtext').children();
               var points = $(subtext).eq(0).text();
               var username = $(subtext).eq(1).text();
               var comments = $(subtext).eq(2).text();
               // Our parsed meta data object
               var metadata = {
                 rank: parseInt(rank),
                 title: title,
                 deepurl: urldeep,
                 points: parseInt(points),
                 username: username,
                 comments: parseInt(comments)
               };
               if(self.uri.href.startsWith('http:'))
                var match = self.uri.href.match(/^http:\/\/[^/]+/);
              else if(self.uri.href.startsWith('https:'))
                var match = self.uri.href.match(/^https:\/\/[^/]+/);

                //console.log("urldeep:" + urldeep);

               if(urldeep != undefined && urldeep.startsWith(match)
                && !urldeep.endsWith('.pdf') && !urldeep.endsWith('.rar') && urldeep != []){
                  urlArray.push(urldeep);
                /* console.log("match:" + match);

               console.log("\nUrlDeep: ");*/
               if(!(urlArray.indexOf(urldeep)===-1)){
                 deepurl.push(urldeep);
               }
              //  console.log(JSON.stringify(urldeep));
              }
             });
             //console.log("DeepCounter  currentUrl→ " + self.uri.href);

        //console.log("↓↓↓  url  ↓↓↓" );

        //console.log("DeepURL:   " + JSON.stringify(deepurl) + "\n\n");
        var data = {
          url: self.uri.href,
          deepurls: deepurl,
          /*scrapped: textData,
          count: counter,*/
          searchWord: searchit
        }
        return callback(data);
        //console.log(data);
    } catch (e) {
      console.log("Connection Error!");
      console.log(e);
      socket.emit('requestError',data);
      return callback(e);
    }
    return callback(data);
    });
  }



  function WordCounter(data, callback) {
  //console.log("↓ WordCounter ↓");
  socket.emit('onprocess',true);

    url = data.url;
    searchWord = data.searchWord;
    //console.log(searchWord);

    request({uri: data.url}, function(err, response, html){
      var self = this;
      //self.items = new Array();//I feel like I want to save my results in an array

      try {
        if(err && response.statusCode !== 200){console.log('Request error.');}
        //console.log(body);
        //console.log(response);

          const $ = cheerio.load(html);

          var textData = $('html *').contents().map(function() {
              return (this.type === 'text') ? $(this).text().trim()+' ' : '';
          }).get().join('');

          //console.log("Text:\n");
          //console.log(textData);

        var loopData = textData.replace(/İ|I|Ü|U|Ş|Ğ|Ç|Ö|Â|Û|Î|ı|î|ğ|ü|ö|ç|â|û|ô|ş|i̇|î/gi, function (x){
          for(var k = 0; k < x.length; k++){
            if(x[k] == 'I') return 'i';
            if(x[k] == 'İ') return 'i';
            if(x[k] == 'Î') return 'i';
            switch(x[k].toLowerCase()){
              case 'î': return 'i';
              case 'i̇': return 'i';
              case 'ı': return 'i';
              case 'î': return 'i';
              case 'ğ': return 'g';
              case 'ü': return 'u';
              case 'ö': return 'o';
              case 'ç': return 'c';
              case 'â': return 'a';
              case 'û': return 'u';
              case 'ô': return 'o';
              case 'ş': return 's';
              default : return  x;
              }
          }
          return x;
        }).toLowerCase();
        var loop = loopData;

        var search = searchWord.replace(/İ|I|Ü|U|Ş|Ğ|Ç|Ö|Â|Û|Î|ı|î|ğ|ü|ö|ç|â|û|ô|ş|i̇|î/gi, function (x){
          for(var k = 0; k < x.length; k++){
            if(x[k] == 'I') return 'i';
            if(x[k] == 'İ') return 'i';
            if(x[k] == 'Î') return 'i';
            switch(x[k].toLowerCase()){
              case 'î': return 'i';
              case 'i̇': return 'i';
              case 'ı': return 'i';
              case 'î': return 'i';
              case 'ğ': return 'g';
              case 'ü': return 'u';
              case 'ö': return 'o';
              case 'ç': return 'c';
              case 'â': return 'a';
              case 'û': return 'u';
              case 'ô': return 'o';
              case 'ş': return 's';
              default : return  x;
              }
          }
          return x;
        });
        search = search.toLowerCase().split(" ");


        var count = 0;
        var counter = [];

        //console.log(search);
        //console.log(loop);

        for (var i = 0; i < search.length; i++) {
          for(var j = 0; j < textData.length; j++){
            var answer = loop.indexOf(search[i]);

            if(answer == -1){
              break;
            }else{
              count++;
              loop = loop.substring(answer + 1);
            }
          }
          counter[i] = count;
          count = 0;
          loop = loopData;
        }

        /*console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
        console.log("_____________________________");
        for (var i = 0; i < counter.length; i++) {
          console.log(search[i] + ": " + counter[i] );
        }
        console.log("¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨");
        console.log("↓↓↓  url  ↓↓↓" );*/


        var data = {
          url: self.uri.href,
          //scrapped: textData,
          count: counter,
          searchit: searchWord
        }
        return callback(data);
        //console.log(data);
    } catch (e) {
      console.log("Connection Error!");
      console.log(e);
      socket.emit('requestError',data);
      return callback(e);
    }
    return callback(data);
    });
  }

})



http.listen(process.env.PORT || 8520, function () {
  console.log('listening on localhost:8520');
})
