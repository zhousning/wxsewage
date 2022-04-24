const config = require('config.js')

var gdlocation = {
    //points.unshift(util.formatTime(new Date()) + ' 经度:' + data.longitude + ' 纬度:' + data.latitude);
    //坐标上传到服务器
    uploadPoints() {
        var points = wx.getStorageSync('points');
        let openid = wx.getStorageSync('openId')
        let task_log_id = wx.getStorageSync('task_log_id')
        if (points.length > 0) {
            wx.request({
                url: config.routes.task_accept_points,
                method: 'POST',
                header: {
                    'Accept': "*/*",
                    'content-type': 'application/json' // 默认值
                },
                data: {
                    id: openid,
                    task_log_id: task_log_id,
                    points: points
                },
                success: function (res) {
                    wx.setStorageSync('points', [])
                },
                fail: function (res) {
                    wx.setStorageSync('points', [])
                }
            })
        }
    },
    //获取经纬度坐标
    get_location() {
        wx.startLocationUpdateBackground({
            success: (res) => {
                wx.onLocationChange((data) => {
                    var currentTime = new Date().getTime();
                    var oldLocation = wx.getStorageSync('oldLocation');
                    var oldTime = wx.getStorageSync('oldTime');
                    var newLocation = data.latitude + "," + data.longitude;
                    var accuracy = data.accuracy;
                    //按总共有200个终端，日调用量总30000
                    //3s产生一个点
                    console.log(newLocation)
                    if (oldLocation != newLocation && currentTime - oldTime > 3000) {
                        wx.setStorageSync('oldLocation', newLocation);
                        wx.setStorageSync('oldTime', currentTime);
                        var points = wx.getStorageSync('points') || [];
                        var point = {
                            location: newLocation,
                            locatetime: currentTime,
                            accuracy: accuracy
                        }
                        points.unshift(point);
                        console.log(points);
                        wx.setStorageSync('points', points)
                        //30s上传一次，一次上传不超过10个点
                        if (points.length > 10) {
                            gdlocation.uploadPoints()
                        }
                    }
                });
            },
            fail: (err) => {
                wx.openSetting()
            }
        })
    },
}

module.exports = gdlocation