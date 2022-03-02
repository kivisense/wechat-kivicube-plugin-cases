Component({
  data: {
    // // 胶囊按钮高度
    menuButtonHeight: "32px",
    // // 左边返回按钮距屏幕顶部的距离
    capsuleTop: "48px",
  },

  lifetimes: {
    attached() {
      //在自定义navigationStyle的情况下自定义返回键的位置需要获取如下信息
      const { top, height } = wx.getMenuButtonBoundingClientRect();

      this.setData({
        menuButtonHeight: height + "px",
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
