Component({
  properties: {
    onPageLeft: {
      type: Boolean,
      value: true,
    },
  },

  data: {
    animationData: {},
  },

  lifetimes: {
    attached() {
      let animation = wx.createAnimation({
        duration: 500,
        timingFunction: "ease-out",
        transformOrigin: this.properties.onPageLeft ? "0 0" : "100% 0",
      });
      this.animation = animation;
      this.copyrightDetailShowing = false;
    },
  },

  methods: {
    onIconClicked() {
      if (this.copyrightDetailShowing) {
        this.animation.scale(0, 0).step();
        this.setData({
          animationData: this.animation.export(),
        });
        this.copyrightDetailShowing = false;
      } else {
        this.animation.scale(1, 1).step();
        this.setData({
          animationData: this.animation.export(),
        });
        this.copyrightDetailShowing = true;
      }
    },
  },
});
