Component({
  properties: {
    tempUrl: {
      type: String,
      value: "",
    },
  },
  data: {
    posterUrl: "",
    showPoster: false,
  },
  lifetimes: {
    async attached() {
      //因为图像追踪造成部分机型运算压力过大，如果用RenderingContext来进行canvas渲染，会造成渲染还未完成就调用了wx.canvasToTempFilePath，这会生成空图片或不完整的图片，
      //所以改用wx.createCanvasContext创建上下文，并使用ctx.draw()，保证生成canvas后再调用wx.canvasToTempFilePath
      const ctx = wx.createCanvasContext("poster-canvas", this);

      const { pixelRatio: dpr, windowWidth } = wx.getSystemInfoSync();

      const vwToPx = (vw) => (windowWidth / 100) * vw;

      const handleImageGeneratingError = () => {
        wx.hideLoading();
        wx.showToast({
          icon: "none",
          title: "照片生成失败，请稍后再试",
          duration: 1000,
        });
      };

      //生成海报背景色
      ctx.setFillStyle("white");
      ctx.fillRect(0, 0, vwToPx(100), vwToPx(173.28));

      try {
        //获取照片的长宽信息（像素值）
        const { width: picWidth, height: picHeight } = await wx.getImageInfo({
          src: this.properties.tempUrl,
        });
        //生成海报内容图
        let imgTotalHeight = (picWidth / 100) * 141.98;
        let imgStartY = (picHeight - imgTotalHeight) / 2;

        ctx.drawImage(
          this.properties.tempUrl,
          0,
          imgStartY,
          picWidth,
          imgTotalHeight,
          0,
          0,
          windowWidth,
          vwToPx(141.98)
        );
      } catch (error) {
        handleImageGeneratingError();
      }

      //生成渐变
      let lingrad = ctx.createLinearGradient(
        0,
        vwToPx(93.89),
        0,
        vwToPx(141.98)
      );
      lingrad.addColorStop(0, "rgba(90, 136, 157, 0)");
      lingrad.addColorStop(1, "#66483B");
      ctx.setFillStyle(lingrad);
      ctx.fillRect(0, vwToPx(93.89), vwToPx(100), vwToPx(48.09));

      //水印
      ctx.drawImage(
        "/asset/watermark.png",
        vwToPx(70.23),
        vwToPx(130.15),
        vwToPx(26.72),
        vwToPx(8.78)
      );

      //生成二维码
      ctx.drawImage(
        "/asset/qrcode.jpg",
        vwToPx(74),
        vwToPx(146.95),
        vwToPx(21.76),
        vwToPx(21.76)
      );

      //生成文本
      ctx.setFillStyle("#51585C");
      ctx.setFontSize(vwToPx(5.4));
      ctx.fillText("扫描“太阳”", vwToPx(6.49), vwToPx(150 + 5.4));
      ctx.fillText(
        "即刻体验AR实境动态壁画。",
        vwToPx(6.49),
        vwToPx(157.63 + 5.4)
      );

      ctx.draw(true, () => {
        wx.canvasToTempFilePath(
          {
            x: 0,
            y: 0,
            width: windowWidth,
            height: windowWidth * 1.7328,
            destWidth: windowWidth * dpr,
            destHeight: windowWidth * 1.7328 * dpr,
            canvasId: "poster-canvas",
            success: (res) => {
              this.setData({
                posterUrl: res.tempFilePath,
                showPoster: true,
              });
              wx.hideLoading();
            },
            fail(e) {
              wx.showToast({
                title: "海报生成失败，请稍后重试",
                icon: "none",
                duration: 1000,
              });
              console.error(e);
            },
          },
          this
        );
      });
    },
  },
  methods: {
    //获取保存图片权限后，保存图片
    async savePhoto() {
      //保存图片到本地
      const savePhotoToAlbum = () => {
        wx.saveImageToPhotosAlbum({
          filePath: this.data.posterUrl,
          success() {
            wx.showToast({
              icon: "none",
              title: "照片已保存到相册",
              duration: 1000,
            });
          },
          fail(e) {
            wx.showToast({
              icon: "none",
              title: "照片保存失败，请稍后再试",
              duration: 1000,
            });
            console.error(e);
          },
        });
      };

      const { authSetting } = await wx.getSetting();
      if (!authSetting["scope.writePhotosAlbum"]) {
        try {
          await wx.authorize({
            scope: "scope.writePhotosAlbum",
          });
          savePhotoToAlbum();
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
                  savePhotoToAlbum();
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
        savePhotoToAlbum();
      }
    },

    rePhoto() {
      this.triggerEvent("rephoto");
    },
  },
});
