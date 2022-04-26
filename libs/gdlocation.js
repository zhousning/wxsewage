const config = require('config.js')

var gdlocation = {

    //points.unshift(util.formatTime(new Date()) + ' 经度:' + data.longitude + ' 纬度:' + data.latitude);
    //坐标上传到服务器
    uploadPoints() {
        var points = wx.getStorageSync('points');
        var cpoints = wx.getStorageSync('cpoints');
        let openid = wx.getStorageSync('openId')
        let task_log_id = wx.getStorageSync('task_log_id')
        if (openid != null && points.length > 0) {
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
                    points: cpoints
                },
                success: function (res) {
                    wx.setStorageSync('points', [])
                    wx.setStorageSync('cpoints', [])
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
                    //var newLocation = data.longitude.toFixed(5) + "," + data.latitude.toFixed(5);
                    var newLocation = data.longitude + "," + data.latitude;
                    //var accuracy = data.accuracy;
                    //按总共有200个终端，日调用量总30000
                    //3s产生一个点
                    if (oldLocation != newLocation && currentTime - oldTime > 3000) {
                        wx.setStorageSync('oldLocation', newLocation);
                        wx.setStorageSync('oldTime', currentTime);
                        var points = wx.getStorageSync('points') || [];
                        var cpoints = wx.getStorageSync('cpoints') || [];
                        var point = {
                            location: newLocation,
                            locatetime: currentTime
                        }
                        points.unshift(point);
                        cpoints.unshift(point);
                        wx.setStorageSync('points', points)
                        wx.setStorageSync('cpoints', cpoints)
                        //30s上传一次，一次上传不超过10个点
                        if (points.length > 10) {
                            config.getNetwork().then(res => {
                                //进入这块 说明是有网络做有网络的事
                                gdlocation.uploadPoints()
                            }).catch(res => {
                                wx.setStorageSync('points', [])
                                console.log(res);
                            })
                        }
                    }
                });
            },
            fail: (err) => {
                console.log(err)
                wx.openSetting()
            }
        })
    },
}

module.exports = gdlocation