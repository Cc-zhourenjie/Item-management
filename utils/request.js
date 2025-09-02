/**
 * 请求后端工具类
 * @author cc
 */

//是否登录
let flag = false;
/**
 * 未登录
 */
function notLogin() {
  if (flag) return;
  wx.showModal({
    title: '提示',
    content: '您还未登录是否前往登录？',
    success(res) {
      console.log("登录");
      if (res.confirm) {
        flag = false
        // reject("用户未登录");
        wx.navigateTo({
          url: '/pages/login/login',
        })
      } else if (res.cancel) {
        flag = false
        console.log('用户点击取消')
      }
    },
    fail: () => {
      console.log("不登录");
      flag = false
    }
  })
  flag = true
}

/**
 * 获取系统内部header标识
 */
function getCommonHeader() {
  let header = {
    'Content-type': 'application/json'
  };
  // 如果token有值则带上
  let token = wx.getStorageSync("token")
  if (token) {
    header = Object.assign({}, header, {
      // 'Authorization': 'Bearer ' + token
      'Authorization': token
    });
  }
  return header;
};

/**
 * 请求后端统一入口
 * @param {请求地址} url 
 * @param {请求数据} data 
 * @param {请求头} header 
 * @param {请求类型} requestType 
 * @param {配置信息} config 
 */
function ccRequest(url, data = {}, header = {}, requestType = "POST", config = {}) {
  header = !header ? {} : header;
  config = !config ? {} : config;
  // 如果token有值则带上
  let token = wx.getStorageSync("token");
  // header 空值处理
  let _header = {
    ...getCommonHeader()
  };
  if (Object.keys(header).length > 0) {
    _header = header;
  }

  let showToast = true,
    showLoading = true,
    loadingTitle = "加载中";
  // 默认显示toast
  if (config['showToast'] != undefined && config['showToast'] == false) {
    showToast = false;
  }
  // 默认显示loading
  if (config['showLoading'] != undefined && config['showLoading'] == true) {
    showLoading = true;
  }
  if (config['loadingTitle']) {
    loadingTitle = config['loadingTitle'];
  }
  //判断是否已经登录
  return new Promise((resolve, reject) => {
    if (!config || !config["no_check_login"] || config["no_check_login"] == false) {
      if (!token) {
        notLogin();
        return;
      }
    }
    // 是否显示loading
    if (showLoading) {
      wx.showLoading({
        title: loadingTitle,
        icon: 'none',
        mask: true
      });
    }
    //执行请求后端
    wx.request({
      url: requestProfix + url,
      data: data,
      header: _header,
      method: requestType,
      success: (res => {
        //如果显示了加载中 => 隐藏加载样式
        if (showLoading) {
          wx.hideLoading();
        }
        // 服务器 非200 错误
        if (res.statusCode && res.statusCode != 200) {
          wx.showToast({
            title: res.msg,
            icon: 'none'
          });
          reject(res);
          return;
        }
        //未登录状态
        if (res.data.code == 433) {
          notLogin();
          return;
        }
        if (res.data && res.data.Success == false) {
          // 业务状态非0 是否提示
          if (showToast) {
            wx.showToast({
              title: res.data.ServerMsg,
              icon: 'none'
            });
          }
          reject(res);
          return;
        }
        //结果返回
        resolve(res.data);
      }),
      fail: (err => {
        console.log("err:", err)
        if (showLoading) {
          wx.hideLoading();
        }
        if (err.errMsg.indexOf('url not in domain list') > -1) {
          wx.showToast({
            title: '请求url不在合法域名中，请打开调试模式',
            icon: 'none'
          });
        }
        if (err.errMsg.indexOf('timeout')) {
          wx.showToast({
            title: '请求超时，请重新进入',
            icon: 'none'
          });
        }
        reject(err);
      })
    });
  });
};

/**
 * get请求后端
 * @param {请求地址} url 
 * @param {请求头扩展参数} header 
 * @param {扩展配置} config 
 */
function ccGet(url, header = {}, config = {}) {
  return ccRequest(url, null, header, "GET", config);
}

/**
 * post请求后端
 * @param {请求地址} url 
 * @param {请求参数} data 
 * @param {请求头扩展参数} header 
 * @param {扩展配置} config 
 */
function ccPost(url, data = {}, header = {}, config = {}) {
  return ccRequest(url, data, header, "POST", config);
}

//请求前缀
const requestProfix = "http://127.0.0.1:10020"

// 暴露接口
module.exports = {
  notLogin,
  // requestProfix,
  ccGet,
  ccPost
};

