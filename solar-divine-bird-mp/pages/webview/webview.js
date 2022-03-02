Page({
  //分享小程序到微信聊天界面
  onShareAppMessage() {
    return {
      title: "扫描线下“The Sun”壁画查看AR效果",
      path: "/pages/index/index",
      imageUrl: "/asset/share.jpg",
    };
  },
  //分享小程序到朋友圈
  onShareTimeline() {
    return {
      title: "扫描线下“The Sun”壁画查看AR效果",
      path: "/pages/index/index",
      imageUrl: "/asset/share.jpg",
    };
  },
});
