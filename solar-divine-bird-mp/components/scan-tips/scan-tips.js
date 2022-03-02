Component({
  data: {
    animationData: {},
  },
  lifetimes: {
    attached() {
      setTimeout(() => {
        let animation = wx.createAnimation({
          duration: 500,
          timingFunction: "ease-out",
        });
        animation.bottom(0).step();

        this.setData({
          animationData: animation.export(),
        });
      }, 3000);
    },
  },
});
