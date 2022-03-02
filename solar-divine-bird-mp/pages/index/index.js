Page({
  data: {
    showVideo: false,
    showChooseBtn: false,
    // 胶囊按钮高度
    menuButtonHeight: "32px",
    // 胶囊按钮位置
    capsuleTop: "48px",
  },

  onLoad() {
    //设置左上角按钮的位置和高度
    const { top: capsuleTop, height: capsuleHeight } =
      wx.getMenuButtonBoundingClientRect();

    this.setData({
      menuButtonHeight: capsuleHeight + "px",
      capsuleTop: capsuleTop + "px",
    });
  },

  videoPlay() {
    this.setData({
      showVideo: true,
    });
  },

  showChooseBtn() {
    this.setData({
      showChooseBtn: true,
    });
  },
  hideChooseBtn() {
    this.setData({
      showChooseBtn: false,
    });
  },

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
