var request = require('request');

var API_KEY = '303fd46fe19131b258d5872b059a70b8';// Dark Sky API_KEY

var getWeather = (lat, lon, callback) => {
    request({
    url : `https://api.darksky.net/forecast/${API_KEY}/${lat},${lon}`,
    json: true
    }, (error, response, body) => {
        if (!error && response.statusCode === 200) {
            callback(undefined, { // 傳入資料整理後的物件，JSON.stringify印出
                timeZone: body.timezone,
                currently: {
                    //C = (F - 32) × 5/9
                    temp: (body.currently.temperature - 32)*5/9,
                    humi: body.currently.humidity,
                    status: body.currently.summary
                }
            });
        } else {
            callback('Unable to connect to DarkSky server');
        }
    });
};

module.exports = {
    getWeather
};
