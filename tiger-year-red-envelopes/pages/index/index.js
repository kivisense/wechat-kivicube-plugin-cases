const { windowWidth, windowHeight } = wx.getSystemInfoSync();

function getPrivate() {
  if (wx.requirePrivacyAuthorize) {
    return new Promise((resolve, reject) => {
      wx.requirePrivacyAuthorize({
        success: (res) => {
          console.log("用户同意了隐私协议");
          resolve(res);
        },
        fail: (res) => {
          reject(res);
          console.log("用户拒绝了隐私协议");
        },
      });
    });
  } else {
    return Promise.resolve();
  }
}

Page({
  data: {
    isShortScreen: windowWidth / windowHeight > 375 / 668,
  },
  async gotoExprience() {
    try {
      await getPrivate();
      wx.navigateTo({
        url: '/Kivicube/pages/exprience/exprience',
      })
    } catch (error) {
      console.log(error);  
    }
  },
  onShareAppMessage() {
    return {
      title: "AR虎娃贺新春",
      path: "/pages/index/index",
      imageUrl: "/asset/share.png",
    };
  },
  onShareTimeline() {
    return {
      title: "AR虎娃贺新春",
      path: "/pages/index/index",
      imageUrl: "/asset/share.png",
    };
  },
});
