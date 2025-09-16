
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
    returnUrl: '' // 登录成功后要返回的页面路径
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取返回地址参数
    if (options.returnUrl) {
      this.setData({
        returnUrl: decodeURIComponent(options.returnUrl)
      });
      console.log('登录成功后将返回:', this.data.returnUrl);
    }
  },
  close() {
    wx.redirectTo({
      url: '/pages/index/index',
      success: () => {
        console.log('关闭登录页面，跳转到首页');
      },
      fail: (err) => {
        console.error('跳转失败:', err);
        wx.showToast({
          title: '跳转失败',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 登录成功后的跳转逻辑
   */
  navigateAfterLogin() {
    const returnUrl = this.data.returnUrl;

    if (returnUrl) {
      // 如果有返回地址，跳转到指定页面
      console.log('跳转到返回页面:', returnUrl);

      // 使用 redirectTo 替换当前页面，避免返回时回到登录页
      wx.redirectTo({
        url: returnUrl,
        success: () => {
          console.log('成功跳转到目标页面:', returnUrl);
        },
        fail: (err) => {
          console.error('跳转到目标页面失败:', err);
          // 如果 redirectTo 失败，尝试使用 navigateTo
          wx.navigateTo({
            url: returnUrl,
            success: () => {
              console.log('使用 navigateTo 成功跳转到目标页面:', returnUrl);
            },
            fail: (err2) => {
              console.error('navigateTo 也失败了:', err2);
              this.fallbackNavigation();
            }
          });
        }
      });
    } else {
      // 没有返回地址，使用默认跳转
      this.fallbackNavigation();
    }
  },

  /**
   * 默认跳转逻辑（当没有返回地址或跳转失败时）
   */
  fallbackNavigation() {
    console.log('使用默认跳转逻辑');
    // 使用 redirectTo 跳转到默认页面，避免返回时回到登录页
    wx.redirectTo({
      url: '/pages/index/index',
      success: () => {
        console.log('成功跳转到默认页面');
      },
      fail: (err) => {
        console.error('跳转到默认页面失败:', err);
        // 如果 redirectTo 失败，尝试使用 navigateTo
        wx.navigateTo({
          url: '/pages/index/index',
          success: () => {
            console.log('使用 navigateTo 成功跳转到默认页面');
          },
          fail: (err2) => {
            console.error('navigateTo 也失败了:', err2);
            wx.showToast({
              title: '跳转失败',
              icon: 'none'
            });
          }
        });
      }
    });
  },
  bindgetuserinfo(res) {
    console.log("res", res)
    if (res.detail.errMsg == 'getUserInfo:ok') {
      let userInfo = {
        ...res.detail.userInfo
      }
      wx.login({
        success: e => {
          console.log("res", res)

          // 存储用户信息
          wx.setStorage({
            key: 'userInfo',
            data: {
              "user_id": "1958435340842741762",
              "open_id": "oE5RJ41SqxK8dAqdMt4E-BIT6ZlE",
              "nick_name": "微信用户",
              "gender": "0",
              "avatar_url": "https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132",
              "telephone": null,
              "token": "7d72b530c9984bcf84a3d39b3717fe60"
            }
          });
          // 存储token
          wx.setStorage({
            key: 'token',
            data: "7d72b530c9984bcf84a3d39b3717fe60"
          });
          return true;
          let code = e.code; //调用wx.login，获取登录凭证（code），并调用接口，将code发送到第三方客户端 
          //封装加密数据
          let encryptedObj = getApp().globalObj.sysCommon.buildEncryptionObj(res.detail.rawData);
          //暂时不追api前缀
          // getApp().globalObj.requestUtils.requestHost("plat");
          let requestApi = "/api/wxapp/user/login";
          let promise = getApp().globalObj.requestUtils.ccPost(requestApi, {
            code: e.code,
            // raw_data: res.detail.rawData,
            encrypted_data_row: encryptedObj,
            signature: res.detail.signature,
            iv: res.detail.iv,
            encrypted_data: res.detail.encryptedData
          }, undefined, { no_check_login: true });
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
              // this.$Message({
              //   content: '登录成功',
              //   type: "success"
              // })
              wx.showToast({
                title: '登录成功',
                icon: 'success', // 显示对勾图标
                duration: 1500
              });

              // 登录成功后跳转
              setTimeout(() => {
                this.navigateAfterLogin();
              }, 1500);
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
      const dialog = this.selectComponent("#login_dialog");
      dialog.linShow({
        title: "登录失败"
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