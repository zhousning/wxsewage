const config = require('config.js')

var appUtil = {
  validLogin: function() {
    var openId = wx.getStorageSync('openId');
    if (!openId) {
      appUtil.appLogin();
    }
  },
  appLogin: function() {
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
            appUtil.appLogin();
          }
        }
      })
    }
    wx.login({
      success: function (res) {
        if (res.code) {
         appUtil.getOpenId(res.code);
        } else {
          restartLogin();
        }
      },
      fail: function () {
        restartLogin();
      }
    })
  },
  getOpenId: function(code) {
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
        if (res.data.openId) {
          wx.hideLoading();
          wx.setStorageSync('openId', res.data.openId);
        } else {
          restartRequest();
        }
      },
      fail: function () {
        //请求失败弹出模态框，重新向服务器请求
        restartRequest();
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
  },
  startGame: function(obj) {
    var openid = wx.getStorageSync('openId');
    var goGame = obj.goGame;
    wx.setStorageSync('score', 0)
    var rank = wx.getStorageSync('rank');
    if (!rank) {
      wx.request({
        url: config.routes.getRank,
        header: {
          'Accept': "*/*",
          'content-type': 'application/json' // 默认值
        },
        data: {
          openid: openid
        },
        success: function (res) {
          console.log(res);
          var rank = parseInt(res.data.rank);
          wx.setStorageSync('rank', rank);
        }
      })
    }
    goGame();
  },
  addScore: function() {
    var score = wx.getStorageSync('score');
    var rank = wx.getStorageSync('rank');
    var openid = wx.getStorageSync("openId");
    if (score && score != 0 && rank != null) {
      wx.request({
        url: config.routes.addScore,
        method: 'POST',
        header: {
          'Accept': "*/*",
          'content-type': 'application/json' // 默认值
        },
        data: {
          openid: openid,
          mark: score,
          step: config.games.rankScore,
          rank: rank
        },
        success: function (res) {
          if (res.data.status == 1) {
            wx.removeStorageSync('score');
            //不在加完成绩后remove rank，是由于victory到开始游戏页面会被频繁使用
            //wx.removeStorageSync('rank');
          }
        }
      })
    }
  }
}

module.exports = appUtil