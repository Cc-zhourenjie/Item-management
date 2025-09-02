/**
 * 时间工具类
 * @author cc
 */

/**
 * 格式化日期时间
 * @param {Date|string|number} date - 日期对象、时间戳或可解析的日期字符串
 * @param {string} format - 格式化模板，默认为 'YYYY-MM-DD HH:mm:ss'
 * @returns {string} 格式化后的日期字符串
 *
 * 支持的格式：
 *   YYYY - 四位年份 (2025)
 *   MM   - 两位月份 (01-12)
 *   DD   - 两位日期 (01-31)
 *   HH   - 24小时制小时 (00-23)
 *   mm   - 分钟 (00-59)
 *   ss   - 秒 (00-59)
 *   SSS  - 毫秒 (000-999)
 */
function formatTime(date, format = 'YYYY-MM-DD HH:mm:ss') {
  // 如果传入的是字符串或数字，尝试转换为 Date 对象
  if (!(date instanceof Date)) {
    if (typeof date === 'string' || typeof date === 'number') {
      date = new Date(date);
    } else {
      // 无效输入，默认使用当前时间
      date = new Date();
    }
  }
  // 如果转换失败，使用当前时间
  if (isNaN(date.getTime())) {
    console.warn('Invalid date input, using current time.');
    date = new Date();
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从0开始
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  const second = String(date.getSeconds()).padStart(2, '0');
  const millisecond = String(date.getMilliseconds()).padStart(3, '0');
  return format
    .replace(/YYYY/g, year)
    .replace(/MM/g, month)
    .replace(/DD/g, day)
    .replace(/HH/g, hour)
    .replace(/mm/g, minute)
    .replace(/ss/g, second)
    .replace(/SSS/g, millisecond);
}

// 添加一些常用的快捷方法
const formatDate = (date) => formatTime(date, 'YYYY-MM-DD');
const formatDateTime = (date) => formatTime(date, 'YYYY-MM-DD HH:mm');
const formatTimeOnly = (date) => formatTime(date, 'HH:mm:ss');

// 暴露接口
module.exports = {
  formatTime,
  formatDate,
  formatDateTime,
  formatTimeOnly
};