// pages/daily-records/item/item-list/itemlist.js
Page({



  /**
   * 页面的初始数据
   */
  data: {
    itemList: [],
    defaultThumb: "http://127.0.0.1:10020/api/oss/file/browse/browse/1967435179282669569"
  },
  appGlobal: getApp().globalObj,

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    var url = getApp().globalObj.requestUtils.requestHost("dr") + "/api/dr/item/info/finditeminfobyuser";

    getApp().globalObj.requestUtils.ccGet(url, null, { is_append_prefix: false, }).then((result) => {
      //处理返回结果
      if (result.data) {
        // 假设后端返回的是数组 result.data.list 或 result.data
        const rawList = Array.isArray(result.data.list) ? result.data.list : (Array.isArray(result.data) ? result.data : []);
        console.log(rawList)
        // 规范化为 van-card 需要的字段
        const normalized = rawList.map((row) => {

          let num = row.item_number - row.item_used_number;
          let numPercentage = Math.trunc(((row.item_number - row.item_used_number) / row.item_number) * 100);

          return {
            // 可根据实际返回字段名替换，如 row.quantity, row.amount, row.remark, row.name, row.imageUrl
            title: row.item_name,
            expiration_time_remark: row.expiration_time_remark,
            valid_date: getApp().globalObj.timeUtils.formatDate(row.valid_date),
            item_price: row.item_price,
            remaining: num + "(" + (numPercentage + "%") + ")",
            item_picture: row.item_picture ? ("http://127.0.0.1:10020/api/oss/file/browse/browse/" + row.item_picture) : this.data.defaultThumb
          }
        });
        this.setData({ itemList: normalized });
      }
      else {
        this.setData({ itemList: [] });
      }

    });

  },

  // 图片加载失败时回退到默认图
  onThumbError(e) {
    console.log("onThumbLoad")
    const index = e.currentTarget.dataset.index;
    const list = this.data.itemList.slice();
    if (list[index]) {
      list[index].item_picture = this.data.defaultThumb;
      this.setData({ itemList: list });
    }
  },

  // 图片加载成功但尺寸异常时（可能为无效预览）回退到默认图
  onThumbLoad(e) {
    console.log("onThumbLoad")
    const index = e.currentTarget.dataset.index;
    const { width, height } = e.detail || {};
    if (!width || !height || width <= 1 || height <= 1) {
      const list = this.data.itemList.slice();
      if (list[index]) {
        list[index].item_picture = this.data.defaultThumb;
        this.setData({ itemList: list });
      }
    }
  },

  // 预览大图
  onPreviewImage(e) {
    const index = e.currentTarget.dataset.index;
    const urls = (this.data.itemList || []).map(it => it.item_picture);
    if (!urls || urls.length === 0) {
      return;
    }
    const current = urls[index] || urls[0];
    if (!current) {
      return;
    }

    wx.showLoading({ title: '加载中', mask: true });
    wx.downloadFile({
      url: current,
      success: (res) => {
        const tempPath = res.tempFilePath;
        if (res.statusCode === 200 && tempPath) {
          wx.previewImage({ current: tempPath, urls: [tempPath] });
        } else {
          wx.previewImage({ current, urls });
        }
      },
      fail: () => {
        wx.previewImage({ current, urls });
      },
      complete: () => {
        wx.hideLoading();
      }
    });
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

  }
})