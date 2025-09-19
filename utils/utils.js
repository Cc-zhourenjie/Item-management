/**
 * 工具类
 * @author cc
 */

/**
 * 随机生成guid
 * @returns guid
 */
function guid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    let r = Math.random() * 16 | 0,
      v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
* 
* @param {当前页面对象} that 
* @param {需要重置的属性名} key 
* @param {需要重置的属性值} value 
*/
function setData(that, key, value) {
  var data = {};
  data[key] = value;
  that.setData(data);
}

/**
 * 生成随机字节
 * @param {字节长度} length 
 */
function generateRandomBytes(length) {
  const key = new Uint8Array(length);
  // 小程序没有 crypto，使用 Math.random 近似（生产环境建议用更安全方式）
  for (let i = 0; i < 16; i++) {
    key[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(key, byte => ('0' + byte.toString(16)).slice(-2)).join('');
}

/**
 * 
 * 合并json数据
 * @param {目标json} target 
 * @param {源json} source 
 * @returns 
 */
function deepMerge(target, ...sources) {
  for (let source of sources) {
    for (let key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        if (!target[key]) target[key] = {};
        deepMerge(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
  }
  return target;
}

/**
 * 判断字符串是否为空（null, undefined, '' 或只包含空白字符）
 * @param {any} str - 待检测的值
 * @returns {boolean} true 表示为空，false 表示非空
 */
function isEmptyString(str) {
  // 首先检查是否为 null 或 undefined
  if (str == null) {
    return true;
  }

  // 转换为字符串并检查是否为空或只包含空白字符
  return String(str).trim() === '';
}


// 暴露接口
module.exports = {
  guid,
  setData,
  deepMerge,
  generateRandomBytes,
  isEmptyString
};