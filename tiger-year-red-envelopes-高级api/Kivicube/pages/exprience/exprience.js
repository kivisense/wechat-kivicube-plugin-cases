// 当分包使用此插件时，必须在使用组件前，调用此方法，设置分包路径。
// 插件版本>=1.5.5支持

const { setPackageRootPath } = requirePlugin("kivicube");
setPackageRootPath("Kivicube");

Page({
  data: {
    //是否显示loading页面，在进入页面时显示，在kivicube-scene场景加载完成后（loadSceneEnd）关闭
    showCustomDownload: true,
    //判断是否加载kivicube-scene,因为kivicube-scene需要摄像机权限，所以获取摄像机权限后再加载整个kivicube-scene组件
    showKiviScene: false,
    //是否显示领取红包封面
    showRedEnvelopes: false,
    //设定kivicube-scene初始化使用的摄像头
    cameraPos: "front",
    //海报标签的显示
    hidePoster: true,
    //需要展示的海报的地址，方便保存，base64字符串，生成速度比canvasToTempFilePath快很多
    posterUrl: "",
  },
  async onLoad() {
    //获取摄像头权限后，渲染kivicube-scene
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
          cancelText: "不授权",
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
    //页面常亮
    wx.setKeepScreenOn({
      keepScreenOn: true,
    });
  },

  //kivicube-scene组件的bindready事件绑定的函数，通过这个函数获取并保存场景的信息
  ready({ detail: view }) {
    this.view = view;
    //跳过云识别
    this.view.skipCloudar();
  },

  //场景加载完成后才关闭loading页面
  loadSceneEnd() {
    this.setData({
      showCustomDownload: false,
    });
  },

  //如果跳过云识别，直接进入这个函数；如果没跳过云识别，在扫描到识别图时进入这个函数
  sceneStart() {
    //5s后展示领取红包封面的弹窗
    setTimeout(() => {
      if (!wx.getStorageSync("redEnvelopesShowed")) {
        wx.setStorageSync("redEnvelopesShowed", true);
        this.setData({
          showRedEnvelopes: true,
        });
      }
    }, 5000);
  },

  //自定义拍照按钮需要2步操作：1，在kivicube-scene上设置hideTakePhoto;2给自定义的点击按钮绑定方法
  generatePhoto() {
    wx.showLoading({
      title: "拍照中",
      mask: true,
    });
    //自定义拍照
    this.view.takePhoto().then(async (photo) => {
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
        src: photo,
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

      const vwToPx = (vw) => (canvas.width / 100) * vw;

      const loadImg = (canvas, imgPath) => {
        return new Promise((resolve, reject) => {
          let img = canvas.createImage();
          img.src = imgPath;
          img.onload = () => {
            resolve(img);
          };
          img.onerror = (e) => {
            reject(new Error("图片加载错误" + " " + e.message));
          };
        });
      };

      //canvas绘制过程中出现的数字均为设计图上的内容
      //生成海报背景图片
      const bgImg = await loadImg(canvas, "/asset/poster-bg.png");
      ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

      //在海报上生成kivicube-scene拍摄出的照片
      let img = await loadImg(canvas, photo);
      //最终生成在海报上照片的宽高比
      let genePhotoRatio = 59.07 / 92.77;
      //获取最终生成海报时所需kivi-scene拍摄出照片的总高度和纵向起始位置
      let imgTotalHeight = picWidth / genePhotoRatio;
      let imgStartY = (picHeight - imgTotalHeight) / 2;
      ctx.drawImage(
        img,
        0,
        imgStartY,
        picWidth,
        imgTotalHeight,
        vwToPx(5.65),
        vwToPx(16.77),
        vwToPx(88.6),
        vwToPx(139.14)
      );

      //生成二维码
      let qrcode = await loadImg(canvas, "/asset/qrcode.png");
      ctx.drawImage(
        qrcode,
        vwToPx(68.9),
        vwToPx(159.45),
        vwToPx(21.04),
        vwToPx(21.34)
      );

      //生成kivisense的logo
      let logo = await loadImg(canvas, "/asset/logo.png");
      ctx.drawImage(
        logo,
        vwToPx(26.22),
        vwToPx(7.32),
        vwToPx(46.04),
        vwToPx(4.57)
      );

      //生成文本
      ctx.fillStyle = "#feeca3";
      ctx.font = `normal 700 ${vwToPx(6.1)}px PingFangSC-Semibold`;
      ctx.fillText("AR虎娃贺新春", vwToPx(8.23), vwToPx(161.59 + 6.1));
      ctx.font = `normal 400 ${vwToPx(4.57)}px PingFangSC`;
      ctx.fillText(
        "即刻体验，领取红包封面",
        vwToPx(8.23),
        vwToPx(161.59 + 6.1 + 8.54)
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
      });

      wx.hideLoading();
    });
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
    console.error(detail);
  },

  //切换前后置摄像头的逻辑
  switchCamera() {
    const position = this.data.cameraPos === "front" ? "back" : "front";
    this.view.switchCamera(position);
    this.setData({
      cameraPos: position,
    });
  },

  //重新拍摄海报的逻辑
  rePhoto() {
    this.setData({
      hidePoster: true,
      posterUrl: "",
    });
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
      fail: (err) => {},
    });
  },
});
