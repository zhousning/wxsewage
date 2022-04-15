// pages/done/repair/repair.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    site_name: '',
    longitude: '',
    latitude: '',
    question: '',
    imgList: [],
    running: [{
        text: '正常',
        value: '0',
        checked: 'true'
      },
      {
        text: '异常',
        value: '1'
      },
    ],
    textareaAValue: ''
  },
  onReady: function (e) {
    var mapCtx = wx.createMapContext('myMap')
    this.locatePosition();
    mapCtx.moveToLocation();
  },
  locatePosition() {
    let that = this;
    wx.showLoading({
      title: '定位中',
    })
    wx.getLocation({
      type: 'gcj02 ',
      isHighAccuracy: true,
      highAccuracyExpireTime: 5000,
      success(res) {
        wx.hideLoading()
        const latitude = res.latitude
        const longitude = res.longitude
        that.setData({
          longitude: longitude,
          latitude: latitude
        })
      },
      fail(res) {
        wx.hideLoading()
        wx.showToast({
          title: '30秒后重试',
          icon: "loading",
          duration: 1000
        })
      }
    })
  },
  textareaAInput(e) {
    this.setData({
      textareaAValue: e.detail.value
    })
  },
  ChooseImage() {
    wx.chooseImage({
      count: 4, //默认9
      sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album'], //从相册选择
      success: (res) => {
        if (this.data.imgList.length != 0) {
          this.setData({
            imgList: this.data.imgList.concat(res.tempFilePaths)
          })
        } else {
          this.setData({
            imgList: res.tempFilePaths
          })
        }
      }
    });
  },
  ViewImage(e) {
    wx.previewImage({
      urls: this.data.imgList,
      current: e.currentTarget.dataset.url
    });
  },
  DelImg(e) {
    wx.showModal({
      // title: '召唤师',
      content: '确定删除？',
      cancelText: '取消',
      confirmText: '确定',
      success: res => {
        if (res.confirm) {
          this.data.imgList.splice(e.currentTarget.dataset.index, 1);
          this.setData({
            imgList: this.data.imgList
          })
        }
      }
    })
  },
  radioChange(e) {
    console.log('radio发生change事件，携带value值为：', e.detail.value)
    const items = this.data.running
    for (let i = 0, len = items.length; i < len; ++i) {
      items[i].checked = items[i].value === e.detail.value
    }
    this.setData({
      running: items
    })
  }
})