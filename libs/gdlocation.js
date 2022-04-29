const config = require('config.js')

var gdlocation = {
    //points.unshift(util.formatTime(new Date()) + ' 经度:' + data.longitude + ' 纬度:' + data.latitude);
    //坐标上传到服务器
    uploadPoints() {
        var cpoints = wx.getStorageSync('cpoints');
        let openid = wx.getStorageSync('openId')
        let task_log_id = wx.getStorageSync('task_log_id')
        if (openid != null && cpoints.length > 0) {
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
    /**
     * 由经纬度计算两点之间的距离，la为latitude缩写，lo为longitude
     * la1 第一个坐标点的纬度
     * lo1 第一个坐标点的经度
     * la2 第二个坐标点的纬度
     * lo2 第二个坐标点的经度
     * (int)s   返回距离(米)
     */
    get_distance: function (lo1, la1, lo2, la2) {
        var La1 = la1 * Math.PI / 180.0;
        var La2 = la2 * Math.PI / 180.0;
        var La3 = La1 - La2;
        var Lb3 = lo1 * Math.PI / 180.0 - lo2 * Math.PI / 180.0;
        var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(La3 / 2), 2) + Math.cos(La1) * Math.cos(La2) * Math.pow(Math.sin(Lb3 / 2), 2)));
        s = s * 6378.137;
        s = Math.round(s * 10000) / 10000;
        s = s.toFixed(2) * 1000;
        return s;
    },
    set_point_storage(newLocation, currentTime) {
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
        return points;
    },
    //获取经纬度坐标
    get_location() {
        if (wx.setScreenBrightness) {
            // 保持屏幕常亮 true / false
            wx.setKeepScreenOn({
                keepScreenOn: true
            });
        }
        //按总共有200个终端，日调用量总30000
        //3s产生一个点, 30s上传一次，一次上传不超过10个点
        wx.startLocationUpdateBackground({
            success: (res) => {
                wx.onLocationChange((data) => {
                    var currentTime = new Date().getTime();
                    var oldLocation = wx.getStorageSync('oldLocation');
                    var oldTime = wx.getStorageSync('oldTime');
                    var new_long = data.longitude.toFixed(5);
                    var new_lat = data.latitude.toFixed(5);
                    var newLocation = new_long + "," + new_lat;

                    if (oldLocation == null) {
                        gdlocation.set_point_storage(newLocation, currentTime);
                    } else {
                        var oldarr = oldLocation.split(',');
                        var old_long = oldarr[0].toFixed();
                        var old_lat = oldarr[1].toFixed();
                        var distance = gdlocation.get_distance(old_long, old_lat, new_long, new_lat);
                        //if (distance > 1 && currentTime - oldTime > 3000) {
                        if (distance > 1) {
                            var points = gdlocation.set_point_storage(newLocation, currentTime);
                            if (points.length > 10) {
                                config.getNetwork().then(res => {
                                    new Promise((resolve, reject) => {
                                        gdlocation.uploadPoints()
                                    })
                                }).catch(res => {
                                    wx.setStorageSync('points', [])
                                })
                            }
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