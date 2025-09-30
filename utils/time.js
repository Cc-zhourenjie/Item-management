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

/**
 * 日期字符串转成时间戳
 * @param {日期字符串} dateString 
 * @returns 
 */
function dateStringToTimestamp(dateString) {
  if (!dateString || typeof dateString !== 'string') return null;
  const timestamp = Date.parse(dateString.replace(/-/g, '/'));
  return isNaN(timestamp) ? null : timestamp;
}

/**
 * 根据输入日期返回相对今日的简洁描述
 * 规则：
 * - 今天 => "今天"
 * - 昨天 => "昨天"
 * - 同一周(以周一为一周开始) => "周一" ~ "周日"
 * - 其他 => "YYYY-MM-DD"
 * @param {Date|string|number} date - 日期对象、时间戳或可解析的日期字符串
 * @returns {string}
 */
function formatRelativeDay(date) {
  // 规范化输入
  if (!(date instanceof Date)) {
    if (typeof date === 'string' || typeof date === 'number') {
      date = new Date(date);
    } else {
      return '';
    }
  }
  if (isNaN(date.getTime())) return '';

  const toStartOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  const timePart = formatTimeOnly(date); // HH:mm:ss

  // 当天、本周计算均基于本地时区的 00:00
  const today = new Date();
  const todayStart = toStartOfDay(today);
  const inputStart = toStartOfDay(date);

  // 今天
  if (inputStart.getTime() === todayStart.getTime()) {
    return '今天 ' + timePart;
  }

  // 昨天
  const yesterdayStart = addDays(todayStart, -1);
  if (inputStart.getTime() === yesterdayStart.getTime()) {
    return '昨天 ' + timePart;
  }

  // 计算周一作为一周的起始
  const startOfWeek = (d) => {
    const day = d.getDay(); // 0(周日)~6(周六)
    const diffToMonday = day === 0 ? -6 : 1 - day; // 周日 -> 往回6天；其他 -> 1-day
    return addDays(toStartOfDay(d), diffToMonday);
  };

  const thisWeekStart = startOfWeek(today);
  const nextWeekStart = addDays(thisWeekStart, 7);

  // 是否在本周(周一 00:00 <= input < 下周一 00:00)
  if (inputStart.getTime() >= thisWeekStart.getTime() && inputStart.getTime() < nextWeekStart.getTime()) {
    const weekdayMap = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return weekdayMap[inputStart.getDay()] + ' ' + timePart;
  }

  // 其他情况：返回标准日期
  return formatTime(inputStart, 'YYYY-MM-DD HH:mm:ss');
}

// 暴露接口
module.exports = {
  formatTime,
  formatDate,
  formatDateTime,
  formatTimeOnly,
  dateStringToTimestamp,
  formatRelativeDay
};