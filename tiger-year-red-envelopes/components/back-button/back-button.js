Component({
  data: {
    // // 胶囊按钮高度
    menuButtonHeight: wx.getStorageSync("menuButtonHeight") + "px",
    // // 左边返回按钮距屏幕顶部的距离
    capsuleTop: wx.getStorageSync("capsuleTop") + "px",
  },
  lifetimes: {
    attached() {
      const { top, height } = wx.getMenuButtonBoundingClientRect();
      this.setData({
        // 胶囊按钮高度 一般是32 如果获取不到就使用32
        menuButtonHeight: height ? height + "px" : "32px",
        //返回按钮的位置
        capsuleTop: top + "px",
      });
    },
  },
  methods: {
    async goBack() {
      try {
        await wx.navigateBack();
      } catch (error) {
        wx.navigateTo({
          url: "/pages/index/index",
        });
      }
    },
  },
});
