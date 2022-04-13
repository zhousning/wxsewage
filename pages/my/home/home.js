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
      appUtils.validLogin();
      wx.getUserProfile({
        desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
        success: (res) => {
          app.globalData.userInfo = res.userInfo;
          wx.setStorageSync('userInfo', res.userInfo);
          appUtils.updateUserInfo(res.userInfo);
          that.setData({
            userInfo: res.userInfo
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
  }
})