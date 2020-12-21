var express = require('express');
var request = require('request');
//var base64url = require('base64-url');
var cheerio = require('cheerio');

var cloudinary = require('./config/cloudinary');
var bot = require('./config/line')
var weather = require('./config/weather');

var subscriptionKey = '8fa8ba3b5e2b49f9aa58c515a2ac85ba';// API key
var uriBase = 'https://eastasia.api.cognitive.microsoft.com/vision/v1.0/analyze?';
var params = {
  'visualFeatures': 'Description, Faces',
  'details': 'Celebrities',
  'language': 'en'
};

bot.on('message', function (event) {
  switch (event.message.type) {
    case 'text':
      switch (event.message.text) {
        case '頭貼分析':
          event.source.profile().then(function (profile) {// get user profile image URL
            var imageUrl = profile.pictureUrl;// image URL
            var options = {
              uri: uriBase,
              qs: params,
              body: '{"url": ' + '"' + imageUrl + '"}',
              headers: {
                'Content-Type': 'application/json',
                'Ocp-Apim-Subscription-Key': subscriptionKey
              }
            };
            request.post(options, (error, response, body) => {
              if (error) {
                console.log('Error: ', error);
                return;
              }
              var jsonResponse = JSON.stringify(JSON.parse(body), null, '  ');
              //console.log('JSON Response\n');
              //console.log(jsonResponse);
              //bot.push(event.source.userId, profile.displayName + "您好，以下是您大頭貼分析: ");
              //bot.push(event.source.userId, profile.pictureUrl);// user display name
              event.reply(profile.displayName + "您好，以下是您大頭貼分析: " + jsonResponse);
            });
          });
          break;

        case '下周油價':
          request.get('https://gas.goodlife.tw/', function (err, res, data) {
            $ = cheerio.load(data);// cheerio 載入html內文, 並儲存至data
            //console.log($('.main P').text());// 下週一 2018 年 07 月 02 日 起, 預計汽油每公升:
            //console.log($('.main h2').text();// 漲跌值
            if ($('.main h2').text().slice(1, 2) === '漲') {// 如果是漲 哭哭貼圖
              event.reply({
                type: 'sticker',
                packageId: '1',
                stickerId: '123'
              });
            } else if ($('.main h2').text().slice(1, 2) === '跌') {// 如果是跌 瀟灑貼圖
              event.reply({
                type: 'sticker',
                packageId: '1',
                stickerId: '120'
              });
            } else {
              event.reply({
                type: 'sticker',
                packageId: '1',
                stickerId: '122'
              });
            }

            var predprice = $('.main P').text() + $('.main h2').text();
            console.log(predprice);
            bot.push(event.source.userId, predprice);
          });
          break;

        case '及時油價':
          request.get('https://gas.goodlife.tw/', function (err, res, data) {
            $ = cheerio.load(data);// cheerio 載入html內文, 並儲存至data
            //console.log($('.main').text());
            var NewArray = new Array();
            var string = $('#cpc').text().replace(/\s+/g, "");// 讀取中油, 台塑 油價資訊, replace(/\s+/g,"")去除空白字串
            var NewArray = string.split('今日台塑油價');
            var cpcprice = NewArray[0].replace(/油價/, "").replace(/92:/, '\n92 : ').replace(/95油價:/, '\n95 : ').replace(/98:/, '\n98 : ').replace(/柴油:/, '\n柴油 : ');
            //console.log(cpcprice);
            var fpcprice = '\n\n' + "今日台塑" + "" + NewArray[1].replace(/92:/, '\n92 : ').replace(/95油價:/, '\n95 : ').replace(/98:/, '\n98 : ').replace(/柴油:/, '\n柴油 : ');
            //console.log(fpcprice);
            event.reply(cpcprice + fpcprice);
          });
          break;

        default:
          event.reply("您好!歡迎使用本系統，善用查看更多資訊選單，或是點選位置資訊即可查看當地天氣慨況");
          break;
      }
      break;

    case 'sticker':
      //console.log("sticker");
      /*亂數回復隨便一張貼圖*/
      //亂數產生stickerId
      var maxstickerId = 430;
      var minstickerId = 1;
      var stickerid = Math.floor(Math.random() * (maxstickerId - minstickerId + 1)) + minstickerId;
      //亂數產生packageId
      var maxpackageId = 4;
      var minpackageId = 1;
      var packageid = Math.floor(Math.random() * (maxpackageId - minpackageId + 1)) + minpackageId;
      event.reply({
        type: 'sticker',
        packageId: packageid,
        stickerId: stickerid
      });
      /********************/
      break;

    case 'location':
      //console.log(event.message.address);
      //console.log(event.message.latitude);// 緯度
      //console.log(event.message.longitude);// 經度
      weather.getWeather(event.message.latitude, event.message.longitude, (errorMessage, weatherResult) => {
        if (errorMessage) {
          console.log(errorMessage);
        } else {
          //console.log(JSON.stringify(weatherResult, undefined, 2));
          event.reply(JSON.stringify(weatherResult, undefined, 2));
        }
      });
      break;

    case 'image':
      console.log(event.message.id);
      console.log(event.message.type);
      console.log(event.source.userId);
      event.message.content().then(function (content) {
        //console.log(content.toString('base64'));
        var binary = content.toString('base64');
        var uploadbinary = "data:image/png;base64," + binary;
        //console.log(uploadbinary);
        cloudinary.uploader.upload(uploadbinary, function (result) {
          console.log(result.url);
          var uploadimg = result.url;
          var imageUrl = uploadimg;// image URL
          var options = {
            uri: uriBase,
            qs: params,
            body: '{"url": ' + '"' + imageUrl + '"}',
            headers: {
              'Content-Type': 'application/json',
              'Ocp-Apim-Subscription-Key': subscriptionKey
            }
          };
          request.post(options, (error, response, body) => {
            if (error) {
              console.log('Error: ', error);
              return;
            }
            var jsonResponse = JSON.stringify(JSON.parse(body), null, '  ');
            //console.log('JSON Response\n');
            //console.log(jsonResponse);
            event.reply(jsonResponse);
          });
        });
      });
      break;

    default:
      break;
  }
});


const app = express();
const linebotParser = bot.parser();
app.post('/', linebotParser);

//因為 express 預設走 port 3000，而 heroku 上預設卻不是，要透過下列程式轉換
var server = app.listen(process.env.PORT || 8080, function () {
  var port = server.address().port;
  console.log("App now running on port", port);
});
