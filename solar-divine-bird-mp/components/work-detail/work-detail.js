Component({
  data: {
    showDetail: false,
    showMoreDetail: false,
    animationData: {},
  },
  lifetimes: {
    attached() {
      let animation = wx.createAnimation({
        duration: 500,
        timingFunction: "ease-out",
      });
      this.animation = animation;
    },
  },
  methods: {
    onClickDetail() {
      this.setData({
        showDetail: true,
      });
    },
    onClickClose() {
      this.setData({
        showDetail: false,
        showMoreDetail: false,
      });
    },
    showMoreDetail() {
      this.setData({
        showMoreDetail: true,
      });
      this.animation.height("124.8vw").step();
      this.setData({
        animationData: this.animation.export(),
      });
    },
    hideMoreDetail() {
      this.setData({
        showMoreDetail: false,
      });
      this.animation.height("54.67vw").step();
      this.setData({
        animationData: this.animation.export(),
      });
    },
  },
});
