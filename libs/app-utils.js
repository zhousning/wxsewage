const config = require('config.js')

var appUtil = {
    validLogin: function () {
        var p = new Promise((resolve, reject) => {
            var openId = wx.getStorageSync('openId');
            var userInfo = wx.getStorageSync('userInfo');
            if (!openId || !userInfo) {
                appUtil.appLogin(resolve, reject);
            }
        })
        return p;
    },
    appLogin: function (resolve, reject) {
        wx.showLoading({
            title: '加载中',
            mask: true
        })

        function restartLogin() {
            wx.hideLoading();
            wx.showModal({
                title: '登录失败',
                content: '请重新登录',
                confirmText: '登录',
                success: function (res) {
                    if (res.confirm) {
                        appUtil.appLogin(resolve, reject);
                    }
                }
            })
        }
        wx.login({
            success: function (res) {
                if (res.code) {
                    appUtil.getOpenId(res.code, resolve, reject);
                } else {
                    restartLogin();
                }
            },
            fail: function () {
                wx.hideLoading();
                wx.showToast({
                    icon: 'error',
                    title: '接口调用失败'
                })
                reject();
            }
        })
    },
    getOpenId: function (code, resolve, reject) {
        function restartRequest() {
            wx.hideLoading();
            wx.showModal({
                title: '加载失败',
                content: '请检查网络是否通畅',
                confirmText: '重试',
                success: function (res) {
                    if (res.confirm) {
                        wx.showLoading({
                            title: '加载中',
                            mask: true
                        })
                        appUtil.getOpenId(code);
                    }
                }
            })
        }
        wx.request({
            url: config.routes.getUserId,
            method: 'POST',
            data: {
                code: code
            },
            header: {
                'Accept': "*/*",
                'content-type': 'application/json' // 默认值
            },
            success: function (res) {
                var obj = res.data;
                if (obj.state == 'success') {
                    wx.hideLoading();
                    wx.setStorageSync('openId', obj.openId);
                    wx.setStorageSync('userInfo', obj.userInfo);
                    resolve();
                } else if (obj.state == 'userinfoerror') {
                    wx.setStorageSync('openId', obj.openId);
                    wx.getUserProfile({ //只能通过点击事件来调用
                        desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
                        success: (res) => {
                            wx.setStorageSync('userInfo', res.userInfo);
                            appUtils.updateUserInfo(res.userInfo);
                            resolve();
                            wx.hideLoading();
                        },
                        fail: (res) => {
                            reject();
                            wx.showToast({
                                title: '接口调用失败',
                                duration: 3000,
                                icon: 'loading'
                            })
                        }
                    })
                } else if (obj.state == 'openiderror') {
                    restartRequest();
                }
            },
            fail: function () {
                restartRequest(); //请求失败弹出模态框，重新向服务器请求
            }
        })
    },
    updateUserInfo: function (userInfo) {
        wx.request({
            url: config.routes.updateUser + wx.getStorageSync('openId'),
            method: 'PUT',
            data: {
                nickname: userInfo.nickName,
                avatarurl: userInfo.avatarUrl,
                gender: userInfo.gender,
                city: userInfo.city,
                province: userInfo.province,
                country: userInfo.country,
                language: userInfo.language
            },
            header: {
                'Accept': "*/*",
                'content-type': 'application/json' // 默认值
            },
            success: function (res) {
                console.log(res.data.status);
            },
            fail: function (res) {
                console.log(res.data.status);
            }
        })
    }
}

module.exports = appUtil