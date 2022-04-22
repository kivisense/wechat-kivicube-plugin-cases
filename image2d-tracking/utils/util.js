// 获取用户设备权限
async function setAuth(scope, title, content) {
  const { authSetting } = await wx.getSetting();
  if (authSetting[scope]) return true;
  try {
    await wx.authorize({
      scope,
    });
    return true;
  } catch (error) {
    const res = await new Promise((resolve) => {
      wx.showModal({
        title,
        content,
        cancelText: "不授权",
        cancelColor: "#999999",
        confirmText: "去授权",
        confirmColor: "#f94218",
        success: resolve,
      });
    });
    if (res.confirm) {
      const { authSetting } = await wx.openSetting();
      if (authSetting[scope]) return true;
      return false;
    } else {
      return false;
    }
  }
}

module.exports = {
  setAuth,
};
