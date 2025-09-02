// index.js
Page({
  data: {
    // 基本信息
    item_name: '',
    item_barcode: '000020250819025525',
    item_code: '20250819025525',
    open_day: '',
    item_state: '-',

    // 数量与价格
    item_number: 1,
    item_number_unit: '',
    item_price: '',
    item_category: '',

    // 生产与有效期
    item_shelf_life_mode: 'shelf_life',
    production_date: '',
    shelf_life: '',
    shelf_life_unit: 'year',
    shelf_life_unit_bak: '年',
    valid_date: '',

    //存放方式
    storage_location: '',
    storage_method: '',
    remark: '',

    // 统一的日历
    showCalendar: false,
    // minDate: new Date(1970, 2, 2).getTime(),
    // maxDate: new Date(2020, 10, 10).getTime(),
    calendarTarget: '',
    pickerTarget: '',
    dateStart: '1900-01-01',
    dateEnd: '2100-12-31'
  },

  submit(event) {
    const { detail } = event;
    /*
      detail 返回三个参数
      1、values: 各表单项的value值
      2、errors: 各表单项验证后的返回的错误信息数组
      3、isValidate: 表单是否验证通过的boolean值
      具体格式示例：
      detail = {
         values: {
             studentName: "",
             studentAge: "",
             studentAddress: ""
         },
         errors: {
             studentName: [],
             studentAge: [],
             studentAddress: []
         },
         isValidate: true
      }
    */
  },

  //监听页面初次渲染完成
  onReady() {
    if (wx && wx.lin && typeof wx.lin.initValidateForm === 'function') {
      wx.lin.initValidateForm(this)
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
    this.setData({ item_name: e.detail.value })
  },
  // 输入条码
  onItemBarcodeInput(e) {
    this.setData({ item_barcode: e.detail.value })
  },
  //输入备注
  onRemarkInput(e) {
    this.setData({ remark: e.detail.value })
  },
  //输入物品数量
  onItemNumberInput(e) {
    this.setData({ item_number: e.detail.value })
  },
  //输入物品价格
  onItemPriceInput(e) {
    this.setData({ item_price: e.detail.value })
  },

  // 点击输入生产日期
  onProductionDate(e) {
    const { value } = e.detail;
    this.setData({ production_date: value });
    this.computeExpireDate();
  },

  // 点击输入保质期
  onValidityDate(e) {
    const { value } = e.detail;
    this.setData({ valid_date: value });
  },


  //输入保质期后事件
  onShelfLifeInput(e) {
    const value = e.detail.value
    // 确保输入的是有效数字
    if (value && !isNaN(Number(value)) && Number(value) > 0) {
      this.setData({ shelf_life: value }, () => {
        // 输入后自动计算有效期
        this.computeExpireDate()
      })
    } else {
      this.setData({ shelf_life: '' })
    }
  },

  // 选择单位与分类
  onChooseUnit() {
    wx.lin && wx.lin.showActionSheet && wx.lin.showActionSheet({
      itemList: [
        { name: '个' },
        { name: '袋' },
        { name: '箱' }
      ],
      success: ({ item }) => {
        this.setData({ item_number_unit: item.name })
      }
    })
  },

  //选择保质期单位
  onChooseShelfLifeUnit() {
    wx.lin && wx.lin.showActionSheet && wx.lin.showActionSheet({
      itemList: [
        { name: '年', value: "year" },
        { name: '月', value: 'month' },
        { name: '日', value: "day" },
        { name: '小时', value: "hour" }
      ],
      success: ({ item }) => {
        this.setData({ shelf_life_unit: item.value, shelf_life_unit_bak: item.name })
      }
    })
  },

  //选择分类
  onChooseCategory() {
    wx.lin && wx.lin.showActionSheet && wx.lin.showActionSheet({
      title: '选择分类',
      itemList: [
        { name: '食品' },
        { name: '日用品' },
        { name: '其他' }
      ],
      success: ({ item }) => {
        this.setData({ item_category: item.name })
      }
    })
  },
  //切换有效期类型
  onChooseExpirationType() {
    const value = this.data.item_shelf_life_mode === 'shelf_life' ? 'validity_period' : 'shelf_life';
    this.setData({ item_shelf_life_mode: value })
  },

  // 打开日历
  openCalendar(e) {
    const target = e.currentTarget.dataset.target
    this.setData({ showCalendar: true, calendarTarget: target })
  },
  // 日历确认后回调事件
  onCalendarConfirm(e) {
    const value = Array.isArray(e.detail) ? e.detail[0] : e.detail
    const key = this.data.calendarTarget
    if (key) {
      this.setData({ [key]: value, showCalendar: false }, () => {
        if (key === 'production_date') this.computeExpireDate()
      })
    } else {
      this.setData({ showCalendar: false })
    }
  },

  // 计算有效期
  computeExpireDate() {
    const { production_date, shelf_life } = this.data
    if (!production_date || !shelf_life || shelf_life === '') {
      this.setData({ valid_date: '' })
      return
    }
    // 确保 shelf_life 是有效数字
    const years = Number(shelf_life)
    if (isNaN(years) || years <= 0) {
      this.setData({ valid_date: '' })
      return
    }
    const parts = production_date.split('-').map(Number)
    if (parts.length !== 3) return
    const y = parts[0] + years
    const m = parts[1]
    const d = parts[2]
    const result = this.formatDate(new Date(y, m - 1, d))
    this.setData({ valid_date: result })
  },
  formatDate(date) {
    const y = date.getFullYear()
    const m = (date.getMonth() + 1).toString().padStart(2, '0')
    const d = date.getDate().toString().padStart(2, '0')
    return `${y}-${m}-${d}`
  },

  //选择存放方式
  onChooseStorageMethod() {
    wx.lin && wx.lin.showActionSheet && wx.lin.showActionSheet({
      itemList: [
        { name: '任意' },
        { name: '常温' },
        { name: '冷冻' },
        { name: '冷藏' },
        { name: '避光通风' }
      ],
      success: ({ item }) => {
        this.setData({ storage_method: item.name })
      }
    })
  },


  // 底部按钮
  onUse() {
    wx.showToast({ title: '使用', icon: 'none' })
  },
  onCopy() {
    const data = JSON.stringify(this.data)
    wx.setClipboardData({ data })
  },
  onSave(e) {
    debugger
    wx.showToast({ title: '已保存', icon: 'success' })
    console.log('save payload', this.data)
  }
})
