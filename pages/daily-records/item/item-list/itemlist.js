// pages/daily-records/item/item-list/itemlist.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    itemList: [],
    defaultThumb: "/pages/daily-records/item/item-list/image/335RN-NbIyJcJlu6HdyMb2.png",
    showEditModal: false,
    useForm: {
      item_name: '',
      number: 1,
      unit: ''
    },
    currentEditIndex: -1,
    showOpenDatePicker: false,
    openDateValue: 0,
    openDateMin: 0,
    openDateMax: 0,
    openDateZIndex: 10010
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
            item_state: row.item_state,
            item_state_bak: row.item_state_bak,
            expiration_time_remark: row.expiration_time_remark,
            valid_date: getApp().globalObj.timeUtils.formatDate(row.valid_date),
            item_price: row.item_price,
            item_count: row.item_number,
            remaining: num,
            remaining_unit: row.item_number_unit_bak,
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
    // 判断是否为本地图片（不以 http 开头）
    const isLocalImage = !current.startsWith('http');

    if (isLocalImage) {
      // 本地图片直接预览
      // wx.previewImage({ current: current, urls: urls });
      wx.showToast({
        title: '暂无物品图',
        icon: 'error', // 显示对勾图标
        duration: 1500
      });
    } else {
      // 网络图片需要先下载
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
    }
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

  // 使用按钮点击事件
  onUseClick(e) {
    const index = e.currentTarget.dataset.index;
    const item = this.data.itemList[index];

    if (!item) {
      console.log('编辑的卡片数据不存在');
      return;
    }

    console.log('点击了编辑按钮:', item);

    // 设置当前编辑的索引和表单数据
    this.setData({
      currentEditIndex: index,
      useForm: {
        item_info_id: item.item_info_id,
        remaining: item.remaining + item.remaining_unit + " (总量:" + item.item_count + item.remaining_unit + ")",
        item_name: item.item_name,
        number: 1,//item.remaining || 1,
        unit: item.remaining_unit || '个',
        item_state: item.item_state
      },
      showEditModal: true
    });
  },

  // 数量输入事件
  onNumberInput(e) {
    const value = parseInt(e.detail.value) || 0;
    this.setData({
      'useForm.number': Math.max(1, value)
    });
  },

  // 数量增加
  onNumberIncrease() {
    const currentNumber = this.data.useForm.number || 0;
    this.setData({
      'useForm.number': currentNumber + 1
    });
  },

  // 数量减少
  onNumberDecrease() {
    const currentNumber = !this.data.useForm.number || this.data.useForm.number <= 0 ? 1 : this.data.useForm.number;
    this.setData({
      'useForm.number': Math.max(1, currentNumber - 1)
    });
  },

  // 弹窗遮罩点击事件
  onModalOverlayClick() {
    if (this.data.showOpenDatePicker) {
      return;
    }
    this.setData({ showEditModal: false });
  },

  // 阻止事件冒泡
  stopPropagation() {
    // 空函数，用于阻止事件冒泡
  },

  // 关闭弹窗
  onCloseModal() {
    this.setData({ showEditModal: false });
  },

  // 使用
  onUse() {
    const idx = this.data.currentEditIndex;
    if (idx < 0 || idx >= this.data.itemList.length) {
      wx.showToast({ title: '未选择物品', icon: 'none' });
      return;
    }

    const item = this.data.itemList[idx];
    const number = Number(this.data.useForm.number) || 0;
    if (number <= 0) {
      wx.showToast({ title: '数量需大于0', icon: 'none' });
      return;
    }
    if (item.remaining != null && number > Number(item.remaining)) {
      wx.showToast({ title: '数量不能超过剩余', icon: 'none' });
      return;
    }

    const data = {
      item_info_id: this.data.useForm.item_info_id || item.item_info_id,
      use_number: number,
      unit: this.data.useForm.unit
    };

    // 调用后端接口（按你后端路由调整路径）
    const url = getApp().globalObj.requestUtils.requestHost("dr") + "/api/dr/item/info/useditem";
    getApp().globalObj.requestUtils.ccPost(url, data, null, { is_append_prefix: false }).then((result) => {
      if (result && result.data) {
        // 本地更新剩余数量并关闭弹窗
        const newRemaining = (Number(item.remaining) || 0) - number;
        this.setData({
          [`itemList[${idx}].remaining`]: newRemaining < 0 ? 0 : newRemaining,
          showEditModal: false
        });
        wx.showToast({ title: '使用成功', icon: 'success' });
      }
    }).catch(() => {
      wx.showToast({ title: '使用失败，请重试', icon: 'none' });
    });
  },

  // 仅开封 / 调整开封日期
  onOpen() {
    const now = new Date();
    const start = new Date(now.getFullYear() - 1, 0, 1).getTime();
    const end = new Date(now.getFullYear() + 1, 11, 31).getTime();
    this.setData({
      showOpenDatePicker: true,
      openDateValue: now.getTime(),
      openDateMin: start,
      openDateMax: end
    });
  },

  //打开日期选择框
  onCancelOpenDate() {
    this.setData({ showOpenDatePicker: false });
  },

  //选择日期后的逻辑
  onConfirmOpenDate(e) {
    const ts = e.detail; // van-datetime-picker 返回时间戳
    const date = new Date(ts);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    if (ts > endOfToday.getTime()) {
      wx.showToast({ title: '选中日期不能大于今天', icon: 'none' });
      return;
    }
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    const now = new Date();
    const hh = now.getHours().toString().padStart(2, '0');
    const mm = now.getMinutes().toString().padStart(2, '0');
    const ss = now.getSeconds().toString().padStart(2, '0');
    const dateStr = `${y}-${m}-${d} ${hh}:${mm}:${ss}`;

    this.setData({ showOpenDatePicker: false });
    wx.showToast({ title: `已选择: ${dateStr}`, icon: 'none' });


    // TODO: 调用后端接口提交开封日期
    let data = {
      item_info_id: this.data.useForm.item_info_id,
      open_day: dateStr,
      item_state: 2
    }
    var url = getApp().globalObj.requestUtils.requestHost("dr") + "/api/dr/item/info/saveiteminfonotlogic";
    getApp().globalObj.requestUtils.ccPost(url, data, null, { is_append_prefix: false, }).then((result) => {
      //保存成功
      if (result.data) {
        this.setData({
          [`itemList[${this.data.currentEditIndex}].open_day`]: dateStr,
          [`itemList[${this.data.currentEditIndex}].item_state`]: 2,
          [`itemList[${this.data.currentEditIndex}].item_state_bak`]: "已开封",
          'useForm.item_state': 2,
          showEditModal: false // 顺便关掉弹窗
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