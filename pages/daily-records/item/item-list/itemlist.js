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
          //组织字段
          return {
            item_info_id: row.item_info_id,
            item_name: row.item_name,
            item_state:row.item_state,
            expiration_time_remark: row.expiration_time_remark,
            valid_date: getApp().globalObj.timeUtils.formatDate(row.valid_date),
            item_price: row.item_price,
            remaining: num,
            remaining_unit: row.item_number_unit,
            remaining_ercentage: "(" + (numPercentage + "%") + ")",
            item_picture: row.item_picture ? getApp().globalObj.requestUtils.getBrowseUrl(row.item_picture) : this.data.defaultThumb
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

  // 卡片点击事件
  onCardClick(e) {
    const index = e.currentTarget.dataset.index;
    const item = this.data.itemList[index];

    if (!item) {
      console.log('点击的卡片数据不存在');
      return;
    }

    console.log('点击了卡片:', item);

    // 这里可以添加您需要的业务逻辑
    // 例如：跳转到详情页、显示更多信息等
    // wx.showToast({
    //   title: `点击了: ${item.title}`,
    //   icon: 'none',
    //   duration: 2000
    // });
    const param = { item_info_id: item.item_info_id }
    const that = this;
    wx.navigateTo({
      url: '/pages/daily-records/item/item-info/iteminfo',
      success: (res) => {
        console.log('成功跳转新页面');
        // 传递参数给下个页面
        res.eventChannel.emit('acceptData', param)
        // 监听返回时的数据
        res.eventChannel.on('backData', function (data) {
          // 简单策略：收到更新标记后刷新当前列表
          if (data && data.updated) {
            // 直接复用 onLoad 的拉取逻辑
            if (typeof that.onLoad === 'function') {
              that.onLoad();
            }
          }
        });
      },
      fail: (err) => {
        wx.showToast({
          title: '当前不能查看详情',
          icon: 'none'
        });
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