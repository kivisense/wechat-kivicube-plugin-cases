// 当分包使用此插件时，必须在使用组件前，调用此方法，设置分包路径。
// 插件版本>=1.5.5支持
const { setPackageRootPath } = requirePlugin("kivicube");
setPackageRootPath("Kivicube");

Page({
  data: {
    //是否显示loading页面，在进入页面时显示，在kivicube-scene场景加载完成后（loadSceneEnd）关闭
    showLoading: true,
    //判断是否加载kivicube-scene,因为kivicube-scene需要摄像机权限，所以获取摄像机权限后再加载整个kivicube-scene组件
    showKiviScene: false,
    //是否显示领取红包封面
    showRedEnvelopes: false,
    //是否隐藏拍照按钮
    hideTakePhoto: false,
    //是否隐藏海报
    hidePoster: true,
    //需要展示的海报的地址，方便保存
    posterUrl: "",
  },

  async onLoad() {
    //获取权限信息
    const { authSetting } = await wx.getSetting();
    if (!authSetting["scope.camera"]) {
      try {
        await wx.authorize({
          scope: "scope.camera",
        });
        this.setData({
          showKiviScene: true,
        });
      } catch (error) {
        wx.showModal({
          title: "摄像头权限被拒绝",
          content: "AR体验需要您授予摄像头权限",
          cancelText: "取消",
          cancelColor: "#999",
          confirmText: "去授权",
          confirmColor: "#f94218",
          success: async (res) => {
            if (res.confirm) {
              const { authSetting } = await wx.openSetting();
              if (authSetting["scope.camera"]) {
                this.setData({
                  showKiviScene: true,
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
      // 有权限则直接获取
      this.setData({
        showKiviScene: true,
      });
    }
  },

  onShow() {
    //返回首页后再次进入ar页面必须再次获得本地存储的情况
    this.setData({
      isRedEnvelopesShowed: wx.getStorageSync("redEnvelopesShowed"),
    });
    //页面常亮
    wx.setKeepScreenOn({
      keepScreenOn: true,
    });
  },

  //若在红包封面还没有弹出时退出了页面，则清除定时器
  onUnload() {
    clearTimeout(this.timer);
  },

  //场景加载完成后才关闭loading页面
  loadSceneEnd() {
    this.setData({
      showLoading: false,
    });
  },

  //如果跳过云识别，直接进入这个函数；如果没跳过云识别，在扫描到识别图时进入这个函数
  sceneStart() {
    const isRedEnvelopesShowed = wx.getStorageSync("redEnvelopesShowed");
    if (!isRedEnvelopesShowed) {
      //5s后展示领取红包封面的弹窗
      this.timer = setTimeout(() => {
        this.setData({
          showRedEnvelopes: true,
        });
        wx.setStorageSync("redEnvelopesShowed", true);
      }, 5000);
    }
  },

  //生成照片后保存的方法，如果需要自定义生成照片的滤镜，则需要自己定义一个canvas再手动合成
  async genephotoPhoto({ detail: photoPath }) {
    wx.showLoading({
      title: "拍照中",
    });

    //在canvas上生成海报
    //获取canvas实例
    const canvasInstance = await new Promise((resolve) => {
      wx.createSelectorQuery()
        .select("#photoCanvas")
        .fields({
          node: true,
          size: true,
        })
        .exec((res) => {
          resolve(res[0]);
        });
    });

    //kivicube-scene生成照片的宽和高信息，在生成海报时裁切照片时用到
    const { width: picWidth, height: picHeight } = await wx.getImageInfo({
      src: photoPath,
    });
    //因为后面要设置canvas画布的实际大小，所以获取物理像素比
    let dpr = wx.getSystemInfoSync().pixelRatio;
    //canvas的宽度和高度，在生成海报时大量使用(逻辑像素)
    const canvasWidth = canvasInstance.width;
    const canvasHeight = canvasInstance.height;

    //获取并存储canvas实例，在生成海报阶段的wx.canvasToTempFilePath使用
    const canvas = canvasInstance.node;

    //获取canvas上下文，在生成海报中绘制各种元素时使用
    const ctx = canvas.getContext("2d");

    //设置canvas画布的大小（物理像素）
    canvas.width = canvasWidth * dpr;
    canvas.height = canvasHeight * dpr;

    //canvas绘制中出现的数字均为设计图上的内容
    //生成海报背景图片
    const bgImg = await this.loadImg(canvas, "/asset/poster-bg.png");
    ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

    //在海报上生成kivicube-scene拍摄出的照片
    let img = await this.loadImg(canvas, photoPath);
    //最终生成在海报上照片的宽高比
    let genePhotoRatio = 59.07 / 92.77;
    let imgTotalHeight = picWidth / genePhotoRatio;
    let imgStartY = (picHeight - imgTotalHeight) / 2;
    ctx.drawImage(
      img,
      0,
      imgStartY,
      picWidth,
      imgTotalHeight,
      (canvas.width / 100) * 5.65,
      (canvas.width / 100) * 16.77,
      (canvas.width / 100) * 88.6,
      (canvas.width / 100) * 139.14
    );

    //生成二维码
    let qrcode = await this.loadImg(canvas, "/asset/qrcode.png");
    ctx.drawImage(
      qrcode,
      (canvas.width / 100) * 68.9,
      (canvas.width / 100) * 159.45,
      (canvas.width / 100) * 21.04,
      (canvas.width / 100) * 21.34
    );

    //生成kivisense的logo
    let logo = await this.loadImg(canvas, "/asset/logo.png");
    ctx.drawImage(
      logo,
      (canvas.width / 100) * 26.22,
      (canvas.width / 100) * 7.32,
      (canvas.width / 100) * 46.04,
      (canvas.width / 100) * 4.57
    );

    //生成文本
    ctx.fillStyle = "#feeca3";
    ctx.font = `normal 700 ${(canvas.width / 100) * 6.1}px PingFangSC-Semibold`;
    ctx.fillText(
      "AR虎娃贺新春",
      (canvas.width / 100) * 8.23,
      (canvas.width / 100) * (161.59 + 6.1)
    );
    ctx.font = `normal 400 ${(canvas.width / 100) * 4.57}px PingFangSC`;
    ctx.fillText(
      "即刻体验，领取红包封面",
      (canvas.width / 100) * 8.23,
      (canvas.width / 100) * (161.59 + 6.1 + 8.54)
    );

    //cnavas转换成能展示的图片
    const { tempFilePath } = await wx.canvasToTempFilePath({
      x: 0,
      y: 0,
      width: canvasWidth,
      height: canvasHeight,
      destWidth: canvas.width,
      destHeight: canvas.height,
      canvas,
    });

    //显示海报，隐藏拍照按钮
    this.setData({
      posterUrl: tempFilePath,
      hidePoster: false,
      hideTakePhoto: true,
    });

    wx.hideLoading();
  },

  loadImg(canvas, imgPath) {
    return new Promise((resolve, reject) => {
      let img = canvas.createImage();
      img.src = imgPath;
      img.onload = (e) => {
        resolve(img);
      };
      img.onerror = (e) => {
        reject(new Error(e.message + +"(图片路径错误)"));
      };
    });
  },

  rePhoto() {
    this.setData({
      hidePoster: true,
      hideTakePhoto: false,
    });
  },

  async savePhoto() {
    const { authSetting } = await wx.getSetting();
    if (!authSetting["scope.writePhotosAlbum"]) {
      try {
        await wx.authorize({
          scope: "scope.writePhotosAlbum",
        });
        this.savePhotoToAlbum();
      } catch (error) {
        wx.showModal({
          title: "相册权限被拒绝",
          content: "保存照片需要您授予相册权限",
          cancelText: "取消",
          cancelColor: "#999",
          confirmText: "去授权",
          confirmColor: "#f94218",
          success: async (res) => {
            if (res.confirm) {
              const { authSetting } = await wx.openSetting();
              if (authSetting["scope.writePhotosAlbum"]) {
                this.savePhotoToAlbum();
              } else {
                return;
              }
            } else if (res.cancel) {
              return;
            }
          },
        });
      }
    } else {
      // 有权限则直接存
      this.savePhotoToAlbum();
    }
  },

  //kivicube-scene的binderror事件绑定的函数，用于判定错误信息，
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
                wx.redirectTo({
                  url: "/" + page.__route__,
                });
              } else {
                wx.showToast({
                  title: "获取“摄像头”权限失败！",
                  icon: "none",
                });
              }
            },
          });
        },
      });
    }
  },

  //分享小程序到微信聊天界面
  onShareAppMessage() {
    return {
      title: "AR虎娃贺新春",
      path: "/pages/index/index",
      imageUrl: "/asset/share.jpg",
    };
  },
  //分享小程序到朋友圈
  onShareTimeline() {
    return {
      title: "AR虎娃贺新春",
      path: "/pages/index/index",
      imageUrl: "/asset/share.jpg",
    };
  },

  //领取红包封面
  showRedPackage() {
    wx.showRedPackage({
      url: "https://support.weixin.qq.com/cgi-bin/mmsupport-bin/showredpacket?receiveuri=abcJqTpylEG&check_type=2#wechat_redirect",
      success: () => {
        this.setData({
          showRedEnvelopes: false,
        });
      },
    });
  },

  //保存图片到本地
  savePhotoToAlbum() {
    wx.saveImageToPhotosAlbum({
      filePath: this.data.posterUrl,
      success: () => {
        wx.showToast({
          icon: "none",
          title: "照片已保存到相册",
          duration: 1000,
        });
      },
    });
  },
});
