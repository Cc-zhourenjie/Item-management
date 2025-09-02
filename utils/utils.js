/**
 * 工具类
 * @author cc
 */

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

// 暴露接口
module.exports = {
  setData,
};