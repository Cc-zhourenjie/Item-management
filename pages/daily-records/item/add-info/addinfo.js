// index.js
Page({
  data: {
    // 基本信息
    item_name: "",
    item_barcode: "000020250819025525",
    item_code: "20250819025525",
    open_day: "",
    item_state: "-",

    // 数量与价格
    item_number: 1,
    item_number_unit: "",
    item_price: "",
    item_category: "",

    // 生产与有效期
    item_shelf_life_mode: "shelf_life",
    production_date: "",
    production_time: "",
    shelf_life: "",
    shelf_life_unit: "year",
    shelf_life_unit_bak: "年",
    valid_date: "",

    //存放方式
    storage_location: "",
    storage_method: "",
    remark: "",

    // 统一的日历
    showCalendar: false,
    // minDate: new Date(1970, 2, 2).getTime(),
    // maxDate: new Date(2020, 10, 10).getTime(),
    calendarTarget: "",
    pickerTarget: "",
    dateStart: "1900-01-01",
    dateEnd: "2100-12-31",
    hours: [],
    minutes: [],
    seconds: [],
    timeMultiIndex: [0, 0, 0],
  },
  //监听页面加载
  onLoad() {
    getApp().globalObj.requestUtils.checkLogin('', function () {
      wx.navigateBack({
        // delta: 1
      })
    });

    const hours = Array.from({ length: 24 }, (_, i) =>
      i.toString().padStart(2, "0")
    );
    const minutes = Array.from({ length: 60 }, (_, i) =>
      i.toString().padStart(2, "0")
    );
    const seconds = Array.from({ length: 60 }, (_, i) =>
      i.toString().padStart(2, "0")
    );
    this.setData({ hours, minutes, seconds });
  },
  //监听页面初次渲染完成
  onReady() {
    if (wx && wx.lin && typeof wx.lin.initValidateForm === "function") {
      wx.lin.initValidateForm(this);
    }
  },
  // 原生日期选择器变更
  // onNativeDateChange(e) {
  //   const { value } = e.detail
  //   const key = this.data.pickerTarget
  //   if (!key) {
  //     this.setData({ selected_date: value })
  //     return
  //   }
  //   this.setData({ [key]: value, selected_date: value }, () => {
  //     if (key === 'production_date') this.computeExpireDate()
  //   })
  // },

  // 输入名称处理
  onItemNameInput(e) {
    this.setData({ item_name: e.detail.value });
  },
  // 输入条码
  onItemBarcodeInput(e) {
    this.setData({ item_barcode: e.detail.value });
  },
  //输入备注
  onRemarkInput(e) {
    this.setData({ remark: e.detail.value });
  },
  //输入物品数量
  onItemNumberInput(e) {
    this.setData({ item_number: e.detail.value });
  },
  //输入物品价格
  onItemPriceInput(e) {
    this.setData({ item_price: e.detail.value });
  },

  // 点击输入生产日期
  onProductionDate(e) {
    const { value } = e.detail;
    this.setData({ production_date: value });
    this.computeExpireDate();
  },

  // 选择生产时间（时分秒）
  onProductionTime(e) {
    // 二次校验：未选日期时提示并重置
    if (!this.data.production_date) {
      wx.lin &&
        wx.lin.showMessage &&
        wx.lin.showMessage({
          duration: 2000,
          type: "warning",
          content: "请先选择生产日期",
        });
      this.setData({ timeMultiIndex: [0, 0, 0], production_time: "" });
      return;
    }
    const indexes = e.detail.value || [];
    const h = this.data.hours[indexes[0]] || "00";
    const m = this.data.minutes[indexes[1]] || "00";
    const s = this.data.seconds[indexes[2]] || "00";
    const production_time = `${h}:${m}:${s}`;
    this.setData({ timeMultiIndex: indexes, production_time }, () => {
      this.computeExpireDate();
    });
  },

  // 点击时间选择器遮罩（未选日期时）
  onTapTimePickerMask() {
    wx.lin &&
      wx.lin.showMessage &&
      wx.lin.showMessage({
        duration: 2000,
        type: "warning",
        content: "请先选择生产日期",
      });
  },

  // 点击输入保质期
  onValidityDate(e) {
    const { value } = e.detail;
    this.setData({ valid_date: value + " 00:00:00" });
  },

  //输入保质期后事件
  onShelfLifeInput(e) {
    const value = e.detail.value;
    // 确保输入的是有效数字
    if (value && !isNaN(Number(value)) && Number(value) > 0) {
      this.setData({ shelf_life: value }, () => {
        // 输入后自动计算有效期
        this.computeExpireDate();
      });
    } else {
      this.setData({ shelf_life: "" });
    }
  },

  // 选择单位与分类
  onChooseUnit() {
    wx.lin &&
      wx.lin.showActionSheet &&
      wx.lin.showActionSheet({
        itemList: [{ name: "个" }, { name: "袋" }, { name: "箱" }],
        success: ({ item }) => {
          this.setData({ item_number_unit: item.name });
        }
      });
  },

  //选择保质期单位
  onChooseShelfLifeUnit() {
    wx.lin &&
      wx.lin.showActionSheet &&
      wx.lin.showActionSheet({
        itemList: [
          { name: "年", value: "year" },
          { name: "月", value: "month" },
          { name: "日", value: "day" },
          { name: "小时", value: "hour" },
        ],
        success: ({ item }) => {
          this.setData({
            shelf_life_unit: item.value,
            shelf_life_unit_bak: item.name,
          });
        }
      });
  },

  //选择分类
  onChooseCategory() {
    wx.lin &&
      wx.lin.showActionSheet &&
      wx.lin.showActionSheet({
        title: "选择分类",
        itemList: [{ name: "食品" }, { name: "日用品" }, { name: "其他" }],
        success: ({ item }) => {
          this.setData({ item_category: item.name });
        }
      });
  },
  //切换有效期类型
  onChooseExpirationType() {
    const value = this.data.item_shelf_life_mode === "shelf_life" ? "validity_period" : "shelf_life";
    this.setData({ item_shelf_life_mode: value });
  },
  // 计算有效期（考虑时分秒）
  computeExpireDate() {
    const { production_date, production_time, shelf_life, shelf_life_unit } = this.data;
    if (!production_date || !shelf_life || shelf_life === "") {
      this.setData({ valid_date: "" });
      return;
    }

    const numericShelfLife = Number(shelf_life);
    if (isNaN(numericShelfLife) || numericShelfLife <= 0) {
      this.setData({ valid_date: "" });
      return;
    }
    const timePart = production_time && production_time.length > 0 ? production_time : "00:00:00";
    const baseDate = new Date(`${production_date} ${timePart}`.replace(/-/g, "/"));
    if (isNaN(baseDate.getTime())) {
      this.setData({ valid_date: "" });
      return;
    }

    const target = new Date(baseDate.getTime());
    switch (shelf_life_unit) {
      case "year":
        target.setFullYear(target.getFullYear() + numericShelfLife);
        break;
      case "month":
        target.setMonth(target.getMonth() + numericShelfLife);
        break;
      case "day":
        target.setDate(target.getDate() + numericShelfLife);
        break;
      case "hour":
        target.setHours(target.getHours() + numericShelfLife);
        break;
      default:
        target.setDate(target.getDate() + numericShelfLife);
        break;
    }
    const result = this.formatDateTime(target);
    this.setData({ valid_date: result });
  },
  //格式化日期
  formatDate(date) {
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, "0");
    const d = date.getDate().toString().padStart(2, "0");
    return `${y}-${m}-${d}`;
  },

  //格式化日期时间
  formatDateTime(date) {
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, "0");
    const d = date.getDate().toString().padStart(2, "0");
    const hh = date.getHours().toString().padStart(2, "0");
    const mm = date.getMinutes().toString().padStart(2, "0");
    const ss = date.getSeconds().toString().padStart(2, "0");
    return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
  },

  //选择存放方式
  onChooseStorageMethod() {
    wx.lin &&
      wx.lin.showActionSheet &&
      wx.lin.showActionSheet({
        itemList: [
          { name: "任意" },
          { name: "常温" },
          { name: "冷冻" },
          { name: "冷藏" },
          { name: "避光通风" },
        ],
        success: ({ item }) => {
          this.setData({ storage_method: item.name });
        }
      });
  },

  // 底部按钮事件
  onUse() {
    wx.showToast({ title: "使用", icon: "none" });
  },
  onCopy() {
    const data = JSON.stringify(this.data);
    wx.setClipboardData({ data });
  },
  onSave(e) {
    console.log("save payload", this.data);

    let isCheck = this.checkSaveData();
    if (!isCheck) {
      return false;
    }

    //获取页面数据
    let jsonValue = getApp().globalObj.utils.deepMerge({}, this.data);

    if (!getApp().globalObj.utils.isEmptyString(jsonValue.production_date)) {
      //没有设置生产日期的时分秒，默认为00:00:00
      if (getApp().globalObj.utils.isEmptyString(jsonValue.production_time)) {
        jsonValue.production_time = "00:00:00";
      }
      //先把之前的数据格式化成：年-月-日（防止每次都追加时分秒的错误数据，一般情况不存在）
      jsonValue.production_date = getApp().globalObj.timeUtils.formatDate(jsonValue.production_date,);
      //生产日期和时间的拼接
      jsonValue.production_date = jsonValue.production_date + " " + jsonValue.production_time;
    }

    //格式化数据
    jsonValue.item_state = jsonValue.item_state == "-" ? 0 : jsonValue.item_state;
    jsonValue.item_price = getApp().globalObj.utils.isEmptyString(jsonValue.item_price) ? 0 : jsonValue.item_price;
    jsonValue.open_day = getApp().globalObj.timeUtils.dateStringToTimestamp(jsonValue.open_day);
    jsonValue.production_date = getApp().globalObj.timeUtils.dateStringToTimestamp(jsonValue.production_date);
    jsonValue.valid_date = getApp().globalObj.timeUtils.dateStringToTimestamp(jsonValue.valid_date);

    //封装加密数据
    var encryptedObj = getApp().globalObj.sysCommon.buildEncryptionObj(jsonValue);
    var url = getApp().globalObj.requestUtils.requestHost("dr");
    url += "/api/dr/item/info/saveiteminfo";
    //保存数据
    getApp().globalObj.requestUtils.ccPost(url, encryptedObj, null, { is_append_prefix: false, }).then((result) => {
      //处理返回结果
      if (result.data) {
        wx.showToast({
          title: '已录入',
          icon: 'success', // 显示对勾图标
          duration: 1500
        });
        setTimeout(function () {
          wx.navigateBack({
            // delta: 1
          })
        }, 500);
      }
      wx.showToast({
        title: '录入失败',
        icon: 'error', // 显示对勾图标
        duration: 1500
      });

    });
  },
  //校验需要保存的数据
  checkSaveData() {
    //校验【名称】数据正确性
    if (getApp().globalObj.utils.isEmptyString(this.data.item_name)) {
      wx.lin.showMessage({
        duration: 2000,
        type: "error",
        content: "物品名称不可为空",
      });
      return false;
    }
    //校验【数量】数据正确性
    if (!this.data.item_number || this.data.item_number <= 0) {
      wx.lin.showMessage({
        duration: 2000,
        type: "error",
        content: "物品数量需大于0",
      });
      return false;
    }
    //校验【数量单位】数据正确性
    if (getApp().globalObj.utils.isEmptyString(this.data.item_number_unit)) {
      wx.lin.showMessage({
        duration: 2000,
        type: "error",
        content: "物品数量单位不可为空",
      });
      return false;
    }
    //判断【有效期类型】处理不同逻辑
    if (this.data.item_shelf_life_mode == "shelf_life") {
      if (!this.data.production_date) {
        wx.lin.showMessage({
          duration: 2000,
          type: "error",
          content: "需填写生产日期",
        });
        return false;
      }
      if (!this.data.shelf_life || this.data.shelf_life <= 0) {
        wx.lin.showMessage({
          duration: 2000,
          type: "error",
          content: "保质期需大于0",
        });
        return false;
      }
    } else if ((this.data.item_shelf_life_mode = "validity_period")) {
      if (!this.data.valid_date) {
        wx.lin.showMessage({
          duration: 2000,
          type: "error",
          content: "需填写有效期",
        });
        return false;
      }
    }

    //校验【存放方式】数据正确性
    if (getApp().globalObj.utils.isEmptyString(this.data.storage_method)) {
      wx.lin.showMessage({
        duration: 2000,
        type: "error",
        content: "未填写存放方式",
      });
      return false;
    }
    return true;
  },
});
