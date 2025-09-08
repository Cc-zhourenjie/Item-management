
function buildEncryptionObj(dataObj) {
    //客户端生成SM4密钥
    // const key = this.generateRandomBytes(16);
    // console.log("key：" + key);

    // //请求后端获取SM2公钥 - 系统初始化就做了

    // //通过SM4加密
    // const encryptedData = getApp().globalObj.securitySM4.encrypt(dataObj, key);
    // console.log("encryptedData：" + encryptedData);

    // //使用SM2公钥加密SM4的秘钥

    // const encryptedKey = getApp().globalObj.securitySM2.doEncrypt(key, getApp().systemConfig.public_key, 1);
    // console.log("encryptedKey：" + encryptedKey);


    //传入的不是字符串格式 -> 格式化传来的数据对象
    if (typeof dataObj != "string") {
        dataObj = JSON.stringify(dataObj);
    }
    //客户端生成SM4密钥
    const key = getApp().globalObj.utils.generateRandomBytes(16);
    console.log("SM4_key：" + key);

    //请求后端获取SM2公钥 - 系统初始化就做了

    //通过SM4加密
    const encryptedData = getApp().globalObj.securitySM4.encrypt(dataObj, key);
    console.log("encryptedData：" + encryptedData);

    //使用SM2公钥加密SM4的秘钥
    let encryptedKey = getApp().globalObj.securitySM2.doEncrypt(key, getApp().systemConfig.public_key, 1);
    console.log("encryptedKey：" + encryptedKey);

    return {
        encrypt_data: encryptedData,
        encrypt_key: encryptedKey,
        security_id: getApp().systemConfig.security_id,
        request_source: "WeChat"
    }

}

module.exports = {
    buildEncryptionObj

}