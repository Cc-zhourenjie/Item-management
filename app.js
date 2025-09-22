// app.js

const { deepMerge } = require('./utils/utils');


App({
  /**
   * 小程序初始化完成时触发（全局只触发一次）
   */
  onLaunch() {
    //系统内置逻辑方法
    const sysCommon = require('/system/common.js');
    //内置工具
    const requestUtils = require('/utils/request.js');
    const utils = require('/utils/utils.js');
    const timeUtils = require('/utils/time.js');
    const securitySM2 = require('/components/security/sm2.js');
    const securitySM4 = require('/components/security/sm4.js');

    this.globalObj = this.globalObj || {}
    this.globalObj.sysCommon = sysCommon
    this.globalObj.requestUtils = requestUtils
    this.globalObj.utils = utils
    this.globalObj.timeUtils = timeUtils
    this.globalObj.securitySM2 = securitySM2
    this.globalObj.securitySM4 = securitySM4

    //加载系统基本配置数据
    let url = this.globalObj.requestUtils.requestHost("plat") + "/api/plat/system/findsystembaseconfig";
    this.globalObj.requestUtils.ccGet(url, null, { no_check_login: true, is_append_prefix: false }).then(result => {
      this.systemConfig = result.data;
      //请求后端获取SM2公钥
      url = this.globalObj.requestUtils.requestHost("plat") + "/api/plat/system/findpublickey/";
      url += this.systemConfig.securityPk;
      this.globalObj.requestUtils.ccGet(url, null, { no_check_login: true, is_append_prefix: false }).then(result => {
        console.log(result.data)
        this.systemConfig = this.globalObj.utils.deepMerge({}, this.systemConfig, result.data);
      });
    });
  },

  globalObj: {},

  systemConfig: {},

})
