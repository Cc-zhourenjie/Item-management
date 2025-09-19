/**
 * 文件上传后端工具类
 * @author cc
 */


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
  return new Promise((resolve, reject) => {
    //判断本次请求是否需要校验登录状态
    if (!config || !config["no_check_login"] || config["no_check_login"] == false) {
      //判断是否已经登录
      if (!token) {
        notLogin();
        reject(new Error('用户未登录'));
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
    if (config && !config["is_append_prefix"] && config["is_append_prefix"] != false) {
      url = requestProfix + url;
    }
    //执行本次请求后端
    wx.request({
      url: url,
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
          reject(new Error('服务器返回未登录状态'));
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


function CommonUploadFile() {

  let sysParam = {};

  /**
   * 初始化
   * @param {文件对象} fileObj 
   * @param {文件参数} fileParam 
   * @param {完成回调} finishFun 
   * @param {进度回调} progressFun 
   * @param {失败回调} failFun 
   */
  this.init = function (fileObj, fileParam, finishFun, progressFun, failFun) {
    if (fileObj) sysParam["file"] = fileObj;
    if (fileParam) sysParam["param"] = fileParam;
    if (finishFun) sysParam["finish_fun"] = finishFun;
    if (progressFun) sysParam["progress_fun"] = progressFun;
    if (failFun) sysParam["fail_fun"] = failFun;
  }

  this.execUpload = function () {
    debugger
    let file = sysParam["file"];//文件内容
    let totalSize = file.size; //文件大小
    //判断文件大小为0字节
    if (totalSize == 0) {
      if (sysParam["fail_fun"]) {
        sysParam["fail_fun"]({ key: this.key, file: this.postfile, errormassage: "传入文件为空文件！" })
      }
      else {
        wx.lin.showMessage({
          duration: 2000,
          type: "error",
          content: "传入文件为空文件！",
        });
      }
      return false;
    }
    //计算所需分片数量
    let blockSize = 1024 * 1024 * 2; //块大小 默认：2Mb 
    let blockTotalCount = Math.ceil(totalSize / blockSize); //总块数
    this.upload(file, totalSize, blockTotalCount, blockSize); //开始发送
  }

  this.upload = function (file, totalSize, blockTotalCount, blockSize) {
    for (let index = 0; index < blockTotalCount; index++) {
      // if (this._chunkUploadCancelled) throw new Error('已取消上传');

      // 需要写入临时分片文件
      const chunkTempPath = `${wx.env.USER_DATA_PATH}/chunk_${uploadId}_${index}.${fileExt}`;
      fs.writeFileSync(chunkTempPath, chunkBuffer);

        // 通过上传文件接口上报分片
        // // formData 约定：uploadId, chunkIndex, totalChunks, fileName
        // this._uploadFilePromise({
        //   url: chunkUrl,
        //   filePath: chunkTempPath,
        //   name: 'file',
        //   formData: {
        //     uploadId,
        //     chunkIndex: index,
        //     totalChunks,
        //     fileName,
        //   },
        // });

    }
  }

}

// 暴露接口
module.exports = {
  commonUploadFile: new CommonUploadFile(),
};

