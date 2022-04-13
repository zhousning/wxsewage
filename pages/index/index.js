// index.js
// 获取应用实例
const app = getApp()
const appUtils = require('../../libs/app-utils');
Page({
  data: {
    PageCur: 'todos'
  },
  NavChange(e) {
    if (app.globalData.userInfo) {
      this.setData({
        PageCur: e.currentTarget.dataset.cur
      })
    } else {
      appUtils.validLogin();
      wx.getUserProfile({
        desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
        success: (res) => {
          app.globalData.userInfo = res.userInfo;
          wx.setStorageSync('userInfo', res.userInfo);
          appUtils.updateUserInfo(res.userInfo);
          this.setData({
            PageCur: e.currentTarget.dataset.cur
          })
        },
        fail: (res) => {
          wx.showToast({
            title: '登录失败',
            duration: 3000,
            icon: 'loading'
          })
        }
      })
    }
  },
  scanRepair() {
    wx.scanCode({
      onlyFromCamera: true,
      success: (res) => {
        //url http://47.104.153.152/factories/16284/devices/16878/info
        var result = res.result
        var url_reg = /http:\/\/47.104.153.152\/factories\/(\d+)\/devices\/(\d+)\/info/
        var pattern = url_reg.test(result)
        if (pattern) {
          var fct_id_reg = /factories\/(\d+)\//
          var device_id_reg = /devices\/(\d+)\//
          var fct_id = result.match(fct_id_reg)[1]
          var device_id = result.match(device_id_reg)[1]
          wx.navigateTo({
            url: '/pages/done/repair/repair?fct_id=' + fct_id + '&device_id=' + device_id
          })
        } else {
          wx.showToast({
            title: '请扫描设备二维码',
            duration: 3000,
            icon: 'loading'
          })
        }

      },
      fail: (res) => {
        wx.showToast({
          title: '扫码失败',
          duration: 3000,
          icon: 'loading'
        })
      }
    })

  }
})