Page({
  data: {
    showLoading: true,
    showAR: false,
    progress: 0,
    showInfo: false,
    showWarning: false,
    showScanTips: false,
    showPoster: false,
    tempUrl: "",
  },
  async onLoad() {
    //获取用户授权信息
    const { authSetting } = await wx.getSetting();

    if (!authSetting["scope.camera"]) {
      try {
        await wx.authorize({
          scope: "scope.camera",
        });
        this.setData({
          showAR: true,
        });
      } catch (error) {
        wx.showModal({
          title: "摄像头权限被拒绝",
          content:
            "AR体验需要您授予摄像头权限，摄像头权限仅用作AR体验时的本地实景画面预览",
          cancelText: "不授权",
          cancelColor: "#999",
          confirmText: "授权",
          confirmColor: "#f94218",
          success: async (res) => {
            if (res.confirm) {
              const { authSetting } = await wx.openSetting();
              if (authSetting["scope.camera"]) {
                this.setData({
                  showAR: true,
                });
              } else {
                wx.navigateBack();
              }
            } else if (res.cancel) {
              wx.navigateBack();
            }
          },
        });
      }
    } else {
      this.setData({
        showAR: true,
      });
    }
  },

  onShow() {
    wx.setKeepScreenOn({
      keepScreenOn: true,
    });
  },

  ready({ detail: view }) {
    this.view = view;
  },

  downloadProgress({ detail }) {
    this.setData({
      progress: parseInt(detail.progress * 100),
    });
  },

  loadEnd() {
    const alphaVideos = this.view.sceneInfo.objects;
    const { name: startName } = alphaVideos[0];
    const { name: loopName } = alphaVideos[1];
    this.startVideo = this.view.getObject(startName);
    this.loopVideo = this.view.getObject(loopName);

    this.startVideo.addEventListener("ended", () => {
      this.startVideoEnded = true;
      this.startVideo.visible = false;
      this.loopVideo.visible = true;
      this.loopVideo.loop = true; // 是否循环播放
      this.loopVideo.videoContext.play();
    });

    this.startVideo.visible = false;
    this.loopVideo.visible = false;
    this.setData({
      showLoading: false,
      showWarning: true,
    });
  },

  tracked() {
    //此标志位为true时（已经track到图像时），点击“知道了”可以直接播放startVideo
    this.imgTracked = true;
    if (!this.data.showWarning) {
      //startVideo未播放完，再次track时，继续播放startVideo。
      //startVideo播放完后，再次track时，循环播放loopVideo
      if (this.startVideoEnded) {
        this.loopVideo.loop = true;
        this.loopVideo.videoContext.play();
      } else {
        this.startVideo.visible = true;
        this.startVideo.loop = false; // 是否循环播放
        this.startVideo.videoContext.play();
      }
      this.setData({
        showInfo: true,
        showScanTips: false,
      });
    }
  },

  lostTrack() {
    this.imgTracked = false;
    if (!this.data.showWarning) {
      this.startVideo.videoContext.pause();
      this.loopVideo.videoContext.pause();
      this.setData({
        showInfo: false,
        showScanTips: true,
      });
    }
  },
  error(e) {
    const { detail } = e;
    // 判定是否camera权限问题，是则向用户申请权限。
    if (detail && detail.isCameraAuthDenied) {
      const page = this;
      wx.showModal({
        title: "提示",
        content: "请给予“摄像头”权限",
        success() {
          wx.openSetting({
            success({ authSetting: { "scope.camera": isGrantedCamera } }) {
              if (isGrantedCamera) {
                wx.redirectTo({ url: "/" + page.__route__ });
              } else {
                wx.showToast({ title: "获取“摄像头”权限失败！", icon: "none" });
              }
            },
          });
        },
      });
    }
    console.error(detail);
  },

  //自定义拍照按钮需要2步操作：1，在kivicube-scene上设置hideTakePhoto;2给自定义的点击按钮绑定方法
  takePhoto() {
    wx.showLoading({
      title: "拍照中",
    });
    this.view
      .takePhoto()
      .then((photoPath) => {
        this.setData({
          tempUrl: photoPath,
          showPoster: true,
        });
      })
      .catch((e) => {
        wx.showToast({
          icon: "none",
          title: "照片生成失败，请稍后再试",
          duration: 1000,
        });
        console.error(e);
      });
  },
  rePhoto() {
    this.setData({
      showPoster: false,
      tempUrl: "",
    });
  },
  closeWarning() {
    if (this.imgTracked) {
      this.startVideo.visible = true;
      this.startVideo.loop = false;
      this.startVideo.videoContext.play();
      this.setData({
        showInfo: true,
      });
    } else {
      this.setData({
        showScanTips: true,
      });
    }
    this.setData({
      showWarning: false,
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
