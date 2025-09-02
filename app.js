// app.js


App({
  /**
   * 小程序初始化完成时触发（全局只触发一次）
   */
  onLaunch() {
    // 引入工具函数
    const requestUtils = require('/utils/request.js');
    const utils = require('/utils/utils.js');
    const timeUtils = require('/utils/time.js');
    this.globalData = this.globalData || {}
    this.globalData.requestUtils = requestUtils
    this.globalData.utils = utils
    this.globalData.timeUtils = timeUtils
  },
  globalData: {}
})
