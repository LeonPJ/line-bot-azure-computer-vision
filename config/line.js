var linebot = require('linebot');

var bot = linebot({
  channelId: '',// Line channel Id
  channelSecret: '',// Line channel Secret
  channelAccessToken: ''// Line channel Access A Token
});

module.exports = bot;
