Component({
  data: {
    // // 胶囊按钮高度
    menuButtonHeight: "32px",
    // // 左边返回按钮距屏幕顶部的距离
    capsuleTop: "48px",
  },
  lifetimes: {
    attached() {
      const { top, height } = wx.getMenuButtonBoundingClientRect();
      this.setData({
        // 胶囊按钮高度 一般是32 如果获取不到就使用32
        menuButtonHeight: height + "px",
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
