const app = getApp()
const appUtils = require('../../../libs/app-utils.js');
Component({
    options: {
        addGlobalClass: true,
    },
    data: {
        userInfo: null
    },

    attached() {
        let that = this;
        wx.showLoading({
            title: '数据加载中',
            mask: true,
        })
        that.setData({
            userInfo: wx.getStorageSync('userInfo')
        })
        wx.hideLoading()
    },
    methods: {
        LogOut() {
            let that = this;
            wx.showModal({
                title: '确认退出？',
                content: '',
                confirmText: '确定',
                success: function (res) {
                    if (res.confirm) {
                        wx.removeStorageSync('openId')
                        wx.removeStorageSync('userInfo')
                        app.globalData.userInfo = null
                        that.setData({
                            userInfo: null
                        })

                    }
                }
            })
        },
        LogIn() {
            let that = this;
            var login = appUtils.validLogin();
            login.then(() => {
                var userInfo = wx.getStorageSync('userInfo');
                app.globalData.userInfo = userInfo;
                that.setData({
                    userInfo: userInfo
                })
            })

        }
    }
})