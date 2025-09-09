// index.js
Page({
  data: {
    // 基本信息
    goodsName: "",
    barcode: "000020250819025525",
    batchNo: "20250819025525",
    openDate: "",
    status: "-",

    // 数量与价格
    quantity: 1,
    unitName: "",
    price: "",
    category: "",

    // 生产与有效期
    prodDate: "",
    prodTime: "",
    shelfLifeYears: "",
    expireDate: "",

    // 统一的日历
    showCalendar: false,
    calendarTarget: "",

    startDateIndexInit: "",
    checkMaxDate: "",
    startDateIndex: "",
    endDateIndexInit: "",
    checkMinDate: "",
    endDateIndex: "",
  },

  onReady() {
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    console.dir("today ==== " + today);
    console.dir(
      "tomorrow ==== " + tomorrow.toLocaleDateString().substring(0, 10)
    );
    this.setData({
      // startDateIndexInit: today.getTime(),
      checkMaxDate: today.toISOString().substring(0, 10),
      startDateIndex: today.toISOString().substring(0, 10),
      checkMinDate: tomorrow.toISOString().substring(0, 10),
      // endDateIndexInit: tomorrow.getTime(), // 设置为明天的日期
      endDateIndex: tomorrow.toISOString().substring(0, 10),
    });
  },

  // 输入处理
  onGoodsNameInput(e) {
    this.setData({ goodsName: e.detail.value });
  },
  onQuantityInput(e) {
    this.setData({ quantity: e.detail.value });
  },
  onPriceInput(e) {
    this.setData({ price: e.detail.value });
  },
  onShelfLifeInput(e) {
    this.setData({ shelfLifeYears: e.detail.value }, this.computeExpireDate);
  },

  /** 处理 picker-view 变更 */
  onDatePickerChange(e) {
    const checkoutDate = e.detail.value;
    const yesterdayStr = new Date(checkoutDate);
    const yd = new Date(yesterdayStr);
    yd.setDate(yd.getDate() - 1);
    // console.dir(checkoutDate);
    console.dir("Out ======> " + yd.toISOString().substring(0, 10));
    if (checkoutDate <= this.data.startDateIndex) {
      wx.showToast({
        title: "离开日期必须晚于入住日期",
        icon: "none",
      });
      return;
    }
    // new Date(checkoutDate).getTime() - 24 * 60 * 60 * 1000
    this.setData({
      endDateIndex: checkoutDate,
      checkMaxDate: yd.toISOString().substring(0, 10),
    });
  },

  // 单位与分类
  onChooseUnit() {
    wx.lin &&
      wx.lin.showActionSheet &&
      wx.lin.showActionSheet({
        itemList: [{ name: "个" }, { name: "袋" }, { name: "箱" }],
        success: ({ item }) => {
          this.setData({ unitName: item.name });
        },
      });
  },
  onChooseCategory() {
    wx.lin &&
      wx.lin.showActionSheet &&
      wx.lin.showActionSheet({
        title: "选择分类",
        itemList: [{ name: "食品" }, { name: "日用品" }, { name: "其他" }],
        success: ({ item }) => {
          this.setData({ category: item.name });
        },
      });
  },

  // 日历与时间
  openCalendar(e) {
    const target = e.currentTarget.dataset.target;
    this.setData({ showCalendar: true, calendarTarget: target });
  },
  onCalendarConfirm(e) {
    const value = Array.isArray(e.detail) ? e.detail[0] : e.detail;
    const key = this.data.calendarTarget;
    if (key) {
      this.setData({ [key]: value, showCalendar: false }, () => {
        if (key === "prodDate") this.computeExpireDate();
      });
    } else {
      this.setData({ showCalendar: false });
    }
  },
  onTimeChange(e) {
    this.setData({ prodTime: e.detail.value });
  },

  // 计算有效期至
  computeExpireDate() {
    const { prodDate, shelfLifeYears } = this.data;
    if (!prodDate || !shelfLifeYears) {
      this.setData({ expireDate: "" });
      return;
    }
    const parts = prodDate.split("-").map(Number);
    if (parts.length !== 3) return;
    const y = parts[0] + Number(shelfLifeYears);
    const m = parts[1];
    const d = parts[2];
    const result = this.formatDate(new Date(y, m - 1, d));
    this.setData({ expireDate: result });
  },
  formatDate(date) {
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, "0");
    const d = date.getDate().toString().padStart(2, "0");
    return `${y}-${m}-${d}`;
  },

  // 底部按钮
  onUse() {
    wx.showToast({ title: "使用", icon: "none" });
  },
  onCopy() {
    const data = JSON.stringify(this.data);
    wx.setClipboardData({ data });
  },
  onSave() {
    wx.showToast({ title: "已保存", icon: "success" });
    console.log("save payload", this.data);
  },
});
