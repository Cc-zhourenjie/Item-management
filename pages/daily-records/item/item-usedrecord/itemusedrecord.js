// pages/daily-records/item/item-usedrecord/itemusedrecord.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentYear: 2025,
    currentMonth: 9,
    calendarDays: [],
    totalAmount: '87.17',
    usageRecords: [
      {
        name: '测试物品01突突突突突突突突www我哦考虑贴膜了',
        quantity: '1个',
        time: '今天 11:20'
      },
      {
        name: '擦擦',
        quantity: '10毫克',
        time: '周四 15:21'
      },
      {
        name: '2阿巴阿巴',
        quantity: '10毫升',
        time: '周四 15:17'
      },
      {
        name: '2阿巴阿巴',
        quantity: '10毫升',
        time: '周四 15:11'
      }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.generateCalendar();
  },

  /**
   * 生成日历数据
   */
  generateCalendar() {
    const { currentYear, currentMonth } = this.data;
    const calendarDays = [];
    
    // 获取当月第一天和最后一天
    const firstDay = new Date(currentYear, currentMonth - 1, 1);
    const lastDay = new Date(currentYear, currentMonth, 0);
    const firstDayOfWeek = firstDay.getDay(); // 0-6，0是周日
    
    // 只添加当月的日期
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(currentYear, currentMonth - 1, day);
      const isToday = this.isToday(date);
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      
      // 模拟一些使用记录数据
      let records = [];
      if (day === 25) {
        records = [
          { name: '擦擦', amount: '10.0毫克', color: '#e8f5e8' },
          { name: '2阿巴阿巴', amount: '21.0毫升', color: '#ffe8f5' },
          { name: '测试物品0...', amount: '1.0', color: '#e8f0ff' }
        ];
      } else if (day === 28) {
        records = [
          { name: '测试物品0...', amount: '1.0', color: '#e8f0ff' }
        ];
      }
      
      calendarDays.push({
        day: day,
        date: `${currentYear}-${currentMonth}-${day}`,
        isCurrentMonth: true,
        isToday: isToday,
        isWeekend: isWeekend,
        records: records
      });
    }
    
    this.setData({
      calendarDays: calendarDays
    });
  },

  /**
   * 判断是否为今天
   */
  isToday(date) {
    const today = new Date();
    return date.getFullYear() === today.getFullYear() &&
           date.getMonth() === today.getMonth() &&
           date.getDate() === today.getDate();
  },

  /**
   * 上一月
   */
  prevMonth() {
    let { currentYear, currentMonth } = this.data;
    currentMonth--;
    if (currentMonth < 1) {
      currentMonth = 12;
      currentYear--;
    }
    this.setData({
      currentYear: currentYear,
      currentMonth: currentMonth
    });
    this.generateCalendar();
  },

  /**
   * 下一月
   */
  nextMonth() {
    let { currentYear, currentMonth } = this.data;
    currentMonth++;
    if (currentMonth > 12) {
      currentMonth = 1;
      currentYear++;
    }
    this.setData({
      currentYear: currentYear,
      currentMonth: currentMonth
    });
    this.generateCalendar();
  },

  /**
   * 选择日期
   */
  selectDate(e) {
    const date = e.currentTarget.dataset.date;
    console.log('选择日期:', date);
    // 这里可以添加选择日期后的逻辑
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