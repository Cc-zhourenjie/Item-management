// pages/daily-records/item/item-usedrecord/itemusedrecord.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentYear: 2025,
    currentMonth: 9,
    calendarDays: [],
    costTotal: '0',
    usageRecords: [
    ],
    selectedDate: '',
    dayGroupUsed: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1; // 1-12
    const day = today.getDate();
    this.setData({ currentYear: year, currentMonth: month });
    let url = getApp().globalObj.requestUtils.requestHost("dr") + "/api/dr/item/used/record/finditemusedmonthtotal";
    getApp().globalObj.requestUtils.ccPost(url, {
      search_date: `${year}-${month}-${day}`,
      search_type: "month"
    }, null, { is_append_prefix: false, }).then((result) => {
      console.log(result);
      let dayGroupUsed = {};
      if (result.data) {
        let costTotal = result.data.current_month_cost_total;
        let totalUsedList = result.data.total_used_list;
        dayGroupUsed = result.data.day_group_used_list;

        let timeUtils = getApp().globalObj.timeUtils;
        const usageRecords = totalUsedList.map((row) => {
          //组织字段
          return {
            item_info_id: row.item_info_id,
            record_id: row.record_id,
            item_name: row.item_name.substring(0, 4) + '...',
            used_volume: row.used_volume,
            item_number_unit_bak: row.item_number_unit_bak,
            item_price: row.item_price,
            item_picture: row.item_picture,
            used_date: timeUtils.formatRelativeDay(row.used_date)
          }
        });
        this.setData({ costTotal: costTotal });
        this.setData({ usageRecords: usageRecords });
        this.setData({ dayGroupUsed: dayGroupUsed });
      }
      this.generateCalendar(dayGroupUsed);
    });
  },

  /**
   * 生成日历数据
   */
  generateCalendar(dayGroupUsed) {
    const { currentYear, currentMonth, selectedDate } = this.data;
    const group = dayGroupUsed || this.data.dayGroupUsed || {};
    const calendarDays = [];

    // 获取当月第一天和最后一天
    const firstDay = new Date(currentYear, currentMonth - 1, 1);
    const lastDay = new Date(currentYear, currentMonth, 0);
    const firstDayOfWeek = firstDay.getDay(); // 0-6，0是周日
    // 以周一为一周起点，计算前置占位数量
    const startOffset = (firstDayOfWeek + 6) % 7; // 周一=0，周日=6

    // 前一个月的占位天（仅用于对齐，不可点击）
    if (startOffset > 0) {
      const prevMonthLastDay = new Date(currentYear, currentMonth - 1, 0).getDate();
      const startDay = prevMonthLastDay - startOffset + 1;
      for (let d = startDay; d <= prevMonthLastDay; d++) {
        const gridIndex = calendarDays.length % 7;
        const isWeekend = gridIndex === 5 || gridIndex === 6; // 周六、周日
        calendarDays.push({
          day: d,
          date: '',
          isCurrentMonth: false,
          isToday: false,
          isWeekend: isWeekend,
          isSelected: false,
          records: [],
          visibleRecords: [],
          hiddenCount: 0
        });
      }
    }

    // 当月日期
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(currentYear, currentMonth - 1, day);
      const isToday = this.isToday(date);
      const gridIndex = calendarDays.length % 7; // 在周中的位置（周一=0）
      const isWeekend = gridIndex === 5 || gridIndex === 6;
      let records = [];
      if (group[day]) {
        let timeUtils = getApp().globalObj.timeUtils;
        records = group[day].map((row) => {
          return {
            item_info_id: row.item_info_id,
            record_id: row.record_id,
            item_name: row.item_name.substring(0, 4) + '...',
            used_volume: row.used_volume,
            item_number_unit_bak: row.item_number_unit_bak,
            item_price: row.item_price,
            item_picture: row.item_picture,
            used_date: timeUtils.formatRelativeDay(row.used_date)
          }
        });
      }

      const dateStr = `${currentYear}-${currentMonth}-${day}`;
      const isSelected = selectedDate === dateStr;

      calendarDays.push({
        day: day,
        date: dateStr,
        isCurrentMonth: true,
        isToday: isSelected ? false : isToday,
        isWeekend: isWeekend,
        isSelected: isSelected,
        records: records,
        visibleRecords: records.slice(0, 3),
        hiddenCount: Math.max(records.length - 3, 0)
      });
    }

    // 末尾补齐到整周
    const remainder = calendarDays.length % 7;
    if (remainder !== 0) {
      const trailing = 7 - remainder;
      for (let d = 1; d <= trailing; d++) {
        const gridIndex = calendarDays.length % 7;
        const isWeekend = gridIndex === 5 || gridIndex === 6;
        calendarDays.push({
          day: d,
          date: '',
          isCurrentMonth: false,
          isToday: false,
          isWeekend: isWeekend,
          isSelected: false,
          records: [],
          visibleRecords: [],
          hiddenCount: 0
        });
      }
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
   * 选择日期
   */
  selectDate(e) {
    const date = e.currentTarget.dataset.date;
    //点击的日期和当前选中的日期相等，不执行二次查询
    if (!date || date == this.data.selectedDate) {
      return false;
    }
    // 标记选中并刷新日历（先立即反馈选中态，再加载数据）
    this.setData({ selectedDate: date });
    this.generateCalendar();
    let url = getApp().globalObj.requestUtils.requestHost("dr") + "/api/dr/item/used/record/finditemusedlist";
    getApp().globalObj.requestUtils.ccPost(url, {
      search_date: date,
      search_type: "day"
    }, null, { is_append_prefix: false, }).then((result) => {
      let usageRecords = [];
      if (result.data) {
        let timeUtils = getApp().globalObj.timeUtils;
        usageRecords = result.data.map((row) => {
          //组织字段
          return {
            item_info_id: row.item_info_id,
            record_id: row.record_id,
            item_name: row.item_name,
            used_volume: row.used_volume,
            item_number_unit_bak: row.item_number_unit_bak,
            item_price: row.item_price,
            item_picture: row.item_picture,
            used_date: timeUtils.formatRelativeDay(row.used_date)
          }
        });
      }
      this.setData({ usageRecords: usageRecords });
    });
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
    const day = 1;
    let url = getApp().globalObj.requestUtils.requestHost("dr") + "/api/dr/item/used/record/finditemusedmonthtotal";
    getApp().globalObj.requestUtils.ccPost(url, {
      search_date: `${currentYear}-${currentMonth}-${day}`,
      search_type: "month"
    }, null, { is_append_prefix: false, }).then((result) => {
      console.log(result);
      let dayGroupUsed = {};
      let costTotal = 0;
      let usageRecords = [];
      if (result.data) {
        costTotal = result.data.current_month_cost_total;
        let totalUsedList = result.data.total_used_list;
        dayGroupUsed = result.data.day_group_used_list;

        let timeUtils = getApp().globalObj.timeUtils;
        usageRecords = totalUsedList.map((row) => {
          //组织字段
          return {
            item_info_id: row.item_info_id,
            record_id: row.record_id,
            item_name: row.item_name,
            used_volume: row.used_volume,
            item_number_unit_bak: row.item_number_unit_bak,
            item_price: row.item_price,
            item_picture: row.item_picture,
            used_date: timeUtils.formatRelativeDay(row.used_date)
          }
        });
      }
      this.setData({ costTotal: costTotal });
      this.setData({ usageRecords: usageRecords });
      this.setData({ dayGroupUsed: dayGroupUsed });
      this.generateCalendar(dayGroupUsed);
    });

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
    const day = 1;
    let url = getApp().globalObj.requestUtils.requestHost("dr") + "/api/dr/item/used/record/finditemusedmonthtotal";
    getApp().globalObj.requestUtils.ccPost(url, {
      search_date: `${currentYear}-${currentMonth}-${day}`,
      search_type: "month"
    }, null, { is_append_prefix: false, }).then((result) => {
      console.log(result);
      let dayGroupUsed = {};
      let costTotal = 0;
      let usageRecords = [];
      if (result.data) {
        costTotal = result.data.current_month_cost_total;
        let totalUsedList = result.data.total_used_list;
        dayGroupUsed = result.data.day_group_used_list;

        let timeUtils = getApp().globalObj.timeUtils;
        usageRecords = totalUsedList.map((row) => {
          //组织字段
          return {
            item_info_id: row.item_info_id,
            record_id: row.record_id,
            item_name: row.item_name,
            used_volume: row.used_volume,
            item_number_unit_bak: row.item_number_unit_bak,
            item_price: row.item_price,
            item_picture: row.item_picture,
            used_date: timeUtils.formatRelativeDay(row.used_date)
          }
        });
      }
      this.setData({ costTotal: costTotal });
      this.setData({ usageRecords: usageRecords });
      this.setData({ dayGroupUsed: dayGroupUsed });
      this.generateCalendar(dayGroupUsed);
    });
  },

  // 卡片点击事件
  onCardClick(e) {
    const index = e.currentTarget.dataset.index;
    const item = this.data.usageRecords[index];

    if (!item) {
      console.log('点击的卡片数据不存在');
      return;
    }
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