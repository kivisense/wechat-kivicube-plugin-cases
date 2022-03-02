const { windowWidth, windowHeight } = wx.getSystemInfoSync();

Page({
  data: {
    isShortScreen: windowWidth / windowHeight > 375 / 668,
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
