Page({
  data: {
    showLoading: true,
    progress: 0,
    showAR: false,
    cameraPos: "front",
  },
  async onLoad() {
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
          cancelText: "取消",
          cancelColor: "#999",
          confirmText: "去授权",
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
  downloadProgress({ detail: progress }) {
    this.setData({
      progress: parseInt(progress * 100),
    });
  },
  loadEnd() {
    this.setData({
      showLoading: false,
    });
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
      mask: true,
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

  //切换前后置摄像头的逻辑
  changeCamera() {
    const position = this.data.cameraPos === "front" ? "back" : "front";
    this.view.switchCamera(position);
    this.setData({
      cameraPos: position,
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
