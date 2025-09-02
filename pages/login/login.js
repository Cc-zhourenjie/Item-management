
import {
  requestProfix,
  ccPost
} from "../../utils/utils"
const app = getApp()
// component/login/login.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  close() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  },
  getUserProfile() {
    wx.getUserProfile({
      desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (resget) => {
        console.log(resget)
        wx.login({
          success(reslogin) {
            console.log(reslogin)
            if (reslogin.errMsg == "login:ok") {
              //发起网络请求
              wx.request({
                url: `${requestProfix}/api/wxapp/user/login`,
                // url: "http://127.0.0.1:10020/api/wxapp/user/login",
                method: "post",
                data: {
                  code: reslogin.code,
                  raw_data: resget.rawData,
                  signature: resget.signature,
                  iv: resget.iv,
                  encrypted_data: resget.encryptedData
                },
                success: (res) => {
                  let rest = res.data;
                  if (res.data.status == 0) {
                    wx.hidenM
                    // 存储用户信息
                    wx.setStorage({
                      key: 'userInfo',
                      data: rest.data
                    })
                    // 存储token
                    wx.setStorage({
                      key: 'token',
                      data: rest.data.token
                    })

                    wx.switchTab({
                      url: '/pages/index/index',
                    })
                  } else {
                    wx.showToast({
                      title: '服务器 ' + res.data.status + ' 错误',
                      icon: 'none'
                    });
                  }
                }
              })
            } else {
              console.log('登录失败！' + res.errMsg)
            }
          }
        })
      }
    })
  },
  bindgetuserinfo(res) {
    console.log("res", res)
    debugger
    if (res.detail.errMsg == 'getUserInfo:ok') {
      let userInfo = {
        ...res.detail.userInfo
      }
      wx.login({
        success: e => {
          console.log("res", res)
          let code = e.code; //调用wx.login，获取登录凭证（code），并调用接口，将code发送到第三方客户端 
          var promise = getApp().globalData.requestUtils.ccPost("/api/wxapp/user/login", {
            code: e.code,
            raw_data: res.detail.rawData,
            signature: res.detail.signature,
            iv: res.detail.iv,
            encrypted_data: res.detail.encryptedData
          }, undefined, { no_check_login: true });
          console.log(promise)
          promise.then(result => {
            let rest = result.data;
            if (result.error_code.code == "200") {
              // 存储用户信息
              wx.setStorage({
                key: 'userInfo',
                data: rest
              });
              // 存储token
              wx.setStorage({
                key: 'token',
                data: rest.token
              });
              // wx.switchTab({
              //   url: '/pages/index/index',
              // });
              this.$Message({
                content: '登录成功',
                type: "success"
              })
            } else {
              wx.showToast({
                title: '服务器错误',
                icon: 'none'
              });
            }
          });
        }
      })
    } else {
      // this.triggerEvent('login', {
      //   status: 0
      // })
      // this.$Message({
      //   content: '登录失败',
      //   type: 'error'
      // });
      // this.handleHide();
      const dialog =  this.selectComponent("#login_dialog");
      dialog.linShow({
        title:"登录失败"
      });
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})