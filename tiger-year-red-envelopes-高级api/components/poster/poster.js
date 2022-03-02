// components/poster/poster.js
Component({
  properties: {
    posterUrl: String,
    //自定义组件手动支持hidden
    hidden: Boolean,
  },

  methods: {
    rePhoto() {
      this.triggerEvent("rephoto");
    },
    //将海报保存到本地相册
    async savePhoto() {
      const { authSetting } = await wx.getSetting();
      //保存图片到本地
      const savePhotoToAlbum = () => {
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
      };
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
  },
});
