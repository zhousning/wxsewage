// pages/todos/process/process.js
const app = getApp()
const config = require('../../../libs/config.js')
const gdlocation = require('../../../libs/gdlocation.js')

Component({
    options: {
        addGlobalClass: true
    },
    data: {
        StatusBar: app.globalData.StatusBar,
        CustomBar: app.globalData.CustomBar,
        items: [],
        start_time: '',
        end_time: '',
        task_ongoing: null,
        task_log_id: ''
    },
    lifetimes: {
        attached: function () {
            let that = this;
            let openid = wx.getStorageSync('openId')
            wx.showLoading({
                title: '数据加载中',
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
                    wx.hideLoading()
                    if (res.statusCode == 200 && res.data.length > 0) {
                        app.globalData.task_ongoing = false;
                        that.setData({
                            items: res.data,
                            task_ongoing: false
                        })
                    }
                },
                fail: function (res) {
                    wx.hideLoading()
                    console.log(res)
                }
            })
        }
    },
    methods: {
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
                        gdlocation.get_location().then(res => {
                            app.globalData.task_ongoing = true;
                            that.setData({
                                task_ongoing: true,
                                start_time: new Date().getTime(),
                                task_log_id: obj.task_log_id
                            })
                            wx.setStorageSync('task_log_id', obj.task_log_id)
                        }).catch(res => {

                        })
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
            var current_time = new Date().getTime();
            var start_time = that.data.start_time;
            if (current_time - start_time > 300000) {
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
                            if (wx.stopLocationUpdate) {
                                wx.stopLocationUpdate({
                                    success: (res) => {
                                        gdlocation.uploadPoints().then(res => {
                                            app.globalData.task_ongoing = false;
                                            that.setData({
                                                task_ongoing: false,
                                                task_log_id: null
                                            })
                                            wx.removeStorageSync('task_log_id')
                                        }).catch(res => {
                                            app.globalData.task_ongoing = false;
                                            that.setData({
                                                task_ongoing: false,
                                                task_log_id: null
                                            })
                                            wx.removeStorageSync('task_log_id')
                                        })
                                    },
                                    fail: (res) => {
                                        wx.showToast({
                                            title: '停止接口调用失败',
                                        })
                                    }
                                })
                            } else {
                                wx.showModal({
                                    title: '提示',
                                    content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
                                })
                            }
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
                            title: '接口调用失败',
                            duration: 3000
                        })
                    }
                })
            } else {
                wx.showToast({
                    icon: 'loading',
                    title: '时长小于5分钟',
                    duration: 2000
                })
            }

        }
    }
})