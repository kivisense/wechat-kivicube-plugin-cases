import { setAuth } from "../../utils/util";
Page({
  playing: false,
  data: {
    scanning: false,
    loading: false,
    photoing: false,
    showScene: false,
    progress: 0,
  },
  shareInfo: {
    path: "/pages/scene/scene",
    title: "AR元宇宙开启 伊弥戟王者出击",
    imageUrl: "/assets/share.jpg",
  },

  onLoad: async function () {
    wx.setKeepScreenOn({
      keepScreenOn: true,
    });
    wx.showLoading({
      title: "加载中...",
    });
    const userAuthorize = await setAuth(
      "scope.camera",
      "摄像头权限被拒绝",
      "AR体验需要您授予摄像头权限，摄像头权限仅用作AR体验时的本地实景画面预览"
    );
    if (!userAuthorize) {
      wx.navigateTo({
        url: "../index/index",
      });
      return;
    }
    this.setData({
      showScene: true,
    });
  },

  onUnload: function () {
    this.stopAllAnim();
    wx.setKeepScreenOn({
      keepScreenOn: false,
    });
  },

  ready: function ({ detail: view }) {
    this.view = view;
    wx.hideLoading();
    this.setData({
      loading: true,
    });
  },

  sceneStart: function () {
    this.stopAllAnim();
    this.setData({
      scanning: true,
      loading: false,
    });
    if (typeof this.view.getObject === "function") {
      this.model = this.view.getObject("image");
      this.mask = this.view.getObject("image-mask");
      this.model.addEventListener("animationEnded", ({ animationName }) => {
        if (animationName !== "start") return;
        this.play(this.model, "loop", true);
      });
    }
    this.mask && this.mask.setEnableMask();
  },

  downloadAssetProgress: function ({ detail }) {
    this.setData({
      progress: detail * 100,
    });
  },

  tracked: function () {
    this.startAnim();
  },

  lostTrack: function () {
    this.stopAllAnim();
  },

  startAnim() {
    if (!this.playing) {
      this.playing = true;
      const { model, mask } = this;
      this.play(model, "start", false);
      this.play(mask, "start", false);
      this.setData({
        scanning: false,
        photoing: true,
      });
    }
  },

  stopAllAnim() {
    this.playing = false;
    this.stop(this.model);
    this.stop(this.mask);
    this.setData({
      scanning: true,
      photoing: false,
    });
  },

  play(model, name, loop) {
    if (!model) return false;
    this.stop(model);
    const names = model.getAnimationNames();
    if (!Array.isArray(names)) return;
    if (!names.includes(name)) return false;
    model.playAnimation({
      name, // 动画名称
      loop, // 是否循环播放
      clampWhenFinished: true, // 播放完毕后是否停留在动画最后一帧
    });
  },

  stop(model) {
    if (!model) return;
    const names = model.getAnimationNames();
    if (!Array.isArray(names)) return;
    names.forEach((name) => {
      model.stopAnimation(name);
    });
  },

  takePhoto: async function () {
    wx.showLoading({ title: "拍照中...", mask: true });
    const photoPath = await this.view.takePhoto();
    wx.navigateTo({
      url: `/pages/photo/photo?photo=${encodeURIComponent(photoPath)}`,
    });
  },

  onShareAppMessage() {
    return this.shareInfo;
  },
});
