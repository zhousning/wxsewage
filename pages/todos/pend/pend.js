// pages/todos/process/process.js
const app = getApp()
const util = require('../../../utils/util')
const config = require('../../../libs/config.js')

Component({
  options: {
    addGlobalClass: true
  },
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    items: [],
    points: [],
    start_time: '',
    end_time: '',
    task_log_id: ''
  },
  lifetimes: {
    attached: function () {
      let that = this;
      let openid = wx.getStorageSync('openId')
      wx.showLoading({
        title: '数据加载中',
        mask: true,
      })
      wx.request({
        url: config.routes.task_query_all,
        method: 'GET',
        header: {
          'Accept': "*/*",
          'content-type': 'application/json' // 默认值
        },
        data: {
          id: openid
        },
        success: function (res) {
          that.setData({
            items: res.data
          })
          wx.hideLoading()
        },
        fail: function (res) {
          wx.hideLoading()
          console.log(res)
        }
      })
    }
  },
  //points.unshift(util.formatTime(new Date()) + ' 经度:' + data.longitude + ' 纬度:' + data.latitude);
  methods: {
    //坐标上传到服务器
    uploadPoints()  {
      if (points.length > 0 ) {
        let openid = wx.getStorageSync('openId')
        let task_log_id = wx.getStorageSync('task_log_id')
        var points = wx.getStorageSync('points');
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
    get_location(that) {
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
              wx.setStorageSync('points', points)
              //30s上传一次，一次上传不超过10个点
              if (points.length > 10) {
                that.uploadPoints() 
              }
            }
          });
        },
        fail: (err) => {
          wx.openSetting()
        }
      })
    },
    //任务开始
    task_start(e) {
      let that = this
      var task_id = e.currentTarget.dataset.task
      let openid = wx.getStorageSync('openId')
      wx.showLoading({
        title: '任务开启中',
        mask: true,
      })
      wx.request({
        url: config.routes.task_start,
        method: 'GET',
        header: {
          'Accept': "*/*",
          'content-type': 'application/json' // 默认值
        },
        data: {
          id: openid,
          task_id: task_id
        },
        success: function (res) {
          wx.hideLoading()
          var obj = res.data
          if (obj.state == 'success') {
            that.setData({
              task_log_id: obj.task_log_id
            })
            wx.setStorageSync('task_log_id', obj.task_log_id)
            that.get_location(that)
          } else {
            wx.showToast({
              icon: 'error',
              title: '开启失败',
            })
          }
        },
        fail: function (res) {
          wx.hideLoading()
          wx.showToast({
            title: '网络错误',
            duration: 3000
          })
        }
      })
    },
    //到达站点
    task_end(e) {
      let that = this
      var task_id = e.currentTarget.dataset.task
      let openid = wx.getStorageSync('openId')
      let task_log_id = wx.getStorageSync('task_log_id')
      wx.showLoading({
        title: '结束中',
        mask: true,
      })
      wx.request({
        url: config.routes.task_end,
        method: 'GET',
        header: {
          'Accept': "*/*",
          'content-type': 'application/json' // 默认值
        },
        data: {
          id: openid,
          task_id: task_id,
          task_log_id: task_log_id,
        },
        success: function (res) {
          wx.hideLoading()
          var obj = res.data
          if (obj.state == 'success') {
            wx.stopLocationUpdate({
              success: (res) => {
                that.uploadPoints() 
                that.setData({
                  task_log_id: null
                })
                wx.removeStorageSync('task_log_id')
              },
            })
          } else {
            wx.showToast({
              icon: 'error',
              title: '结束失败',
            })
          }
        },
        fail: function (res) {
          wx.hideLoading()
          wx.showToast({
            title: '网络错误',
            duration: 3000
          })
        }
      })

    }
  }
})