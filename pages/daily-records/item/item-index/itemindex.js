// pages/daily-records/item/item-index/itemindex.js



Page({

  /**
   * 页面的初始数据
   */
  data: {

    grids1: [{
      index: 1,
      image: "comment",
      text: "助力"
    }, {
      index: 2,
      image: "comment",
      text: "助力2"
    }, {
      index: 3,
      image: "comment",
      text: "助力"
    }, {
      index: 4,
      image: "comment",
      text: "助力"
    }, {
      index: 5,
      image: "comment",
      text: "助力"
    }, {
      index: 6,
      image: "comment",
      text: "助力"
    }, {
      index: 7,
      image: "comment",
      text: "助力"
    }]

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },


  openLink(e) {
    let detail = e.detail;
    if ("add" == detail.key) {
      console.log("录入")
      wx.navigateTo({
        url: '/pages/daily-records/item/add-info/addinfo',
        success: () => {
          console.log('成功跳转新页面');
        },
        fail: (err) => {
          wx.showToast({
            title: '跳转失败',
            icon: 'none'
          });
        }
      })
      // wx.switchTab({
      //   url: '/pages/daily-records/item/add-info/addinfo',
      //   success: () => {
      //     console.log('成功跳转到默认页面');
      //   },
      //   fail: (err) => {
      //     wx.showToast({
      //       title: '跳转失败',
      //       icon: 'none'
      //     });
      //   }
      // });
    }
    else if ("my_item" == detail.key) {
      console.log("我的物品")
    }
    else if ("use_record" == detail.key) {
      console.log("使用记录")
    }

  }

})