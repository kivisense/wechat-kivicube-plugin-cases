// 当分包使用此插件时，必须在使用组件前，调用此方法，设置分包路径。
// 插件版本>=1.5.5支持
const { setPackageRootPath, setOptions } = requirePlugin("kivicube");
setPackageRootPath("Kivicube");
setOptions({
  license:
    "Jt2bvLYURohP8VTC05Z04MdqPPG0XIfAkYAfNNCt2/WbeqFNezNhw6f4mEPHr6A5gu99ne+8mFFlAcRG1Nn5Md4hcwMhiyg1OG3+mHGJDESexvmCNqo0eo92fyNM9GEjzYQgfubNT9+uz8fvQfyRRXKY7KpDADDiZhZ8h7S82RAilRvEZMUQoGmh3uV25fHaQbCQPIKKRK48t5vJQ0VPT2PTjD0qH2hf7NCfBSVglWL4/U9DbfscvbNSN81EKUSKpIl2PoII+QVHprgIlULoiomhA+raupthKFiEQetVIAp7C+W2iucj8qh7lNVZt8Qpr6dETNWj6GOp8x28JaNQ8g==",
});

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

  downloadProgress({ detail: progress }) {
    this.setData({
      progress: parseInt(progress * 100),
    });
  },

  loadEnd() {
    const { name } = this.view.sceneInfo.objects[0];
    this.obj = this.view.getObject(name);
    this.obj.visible = false;
    this.setData({
      showLoading: false,
      showWarning: true,
    });
  },

  tracked() {
    this.imgTracked = true;
    if (!this.data.showWarning) {
      this.obj.visible = true;
      this.setData({
        showInfo: true,
        showScanTips: false,
      });
    }
  },

  lostTrack() {
    this.imgTracked = false;
    if (!this.data.showWarning) {
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
    this.view.takePhoto().then((photoPath) => {
      this.setData({
        tempUrl: photoPath,
        showPoster: true,
      });
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
      this.obj.visible = true;
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
