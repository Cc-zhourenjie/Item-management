const request = require('./request');
const wx = require('jest-wechat-mock');

// 模拟 wx 相关 API
jest.mock('wx', () => ({
  getStorageSync: jest.fn(),
  showToast: jest.fn(),
  showModal: jest.fn(),
  navigateTo: jest.fn(),
  showLoading: jest.fn(),
  hideLoading: jest.fn(),
  request: jest.fn(),
}));

describe('request.js 单元测试', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('checkLogin 函数', () => {
    it('未登录时调用 notLogin', () => {
      wx.getStorageSync.mockReturnValue(null);
      request.checkLogin();
      expect(wx.showModal).toHaveBeenCalled();
    });

    it('已登录但令牌无效时显示错误', () => {
      wx.getStorageSync.mockReturnValue('valid_token');
      wx.request.mockImplementation(({ success }) => {
        success({ data: { error_code: { code: '400' } } });
      });
      request.checkLogin();
      expect(wx.showToast).toHaveBeenCalledWith({
        title: '服务器错误',
        icon: 'none',
      });
    });
  });

  describe('notLogin 函数', () => {
    it('显示登录提示模态框', () => {
      request.notLogin();
      expect(wx.showModal).toHaveBeenCalled();
    });

    it('用户确认登录后跳转登录页面', () => {
      wx.showModal.mockImplementation(({ success }) => {
        success({ confirm: true });
      });
      request.notLogin();
      expect(wx.navigateTo).toHaveBeenCalled();
    });
  });

  describe('ccRequest 函数', () => {
    it('未登录时拒绝请求', () => {
      wx.getStorageSync.mockReturnValue(null);
      const promise = request.ccRequest('/api/test');
      return expect(promise).rejects.toThrow('用户未登录');
    });

    it('请求成功时返回数据', () => {
      wx.getStorageSync.mockReturnValue('valid_token');
      wx.request.mockImplementation(({ success }) => {
        success({ statusCode: 200, data: { Success: true } });
      });
      const promise = request.ccRequest('/api/test');
      return expect(promise).resolves.toEqual({ Success: true });
    });

    it('请求失败时显示错误', () => {
      wx.getStorageSync.mockReturnValue('valid_token');
      wx.request.mockImplementation(({ fail }) => {
        fail({ errMsg: 'timeout' });
      });
      const promise = request.ccRequest('/api/test');
      return expect(promise).rejects.toEqual(expect.any(Error));
    });
  });

  describe('ccGet 和 ccPost 函数', () => {
    it('ccGet 调用 GET 请求', () => {
      wx.getStorageSync.mockReturnValue('valid_token');
      wx.request.mockImplementation(({ success }) => {
        success({ statusCode: 200, data: { Success: true } });
      });
      const promise = request.ccGet('/api/test');
      return expect(promise).resolves.toBeDefined();
    });

    it('ccPost 调用 POST 请求', () => {
      wx.getStorageSync.mockReturnValue('valid_token');
      wx.request.mockImplementation(({ success }) => {
        success({ statusCode: 200, data: { Success: true } });
      });
      const promise = request.ccPost('/api/test', {});
      return expect(promise).resolves.toBeDefined();
    });
  });
});