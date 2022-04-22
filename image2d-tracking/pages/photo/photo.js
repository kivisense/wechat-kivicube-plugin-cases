const { setAuth } = require("../../utils/util");

Page({
  data: {
    photo: "",
    marginTop: 0,
  },
  shareInfo: {
    path: "/pages/index/index",
    title: "AR元宇宙开启 伊弥戟王者出击",
    imageUrl: "/assets/share.jpg",
  },
  async onLoad({ photo: photoUrl }) {
    const menu = wx.getMenuButtonBoundingClientRect();
    this.setData({
      marginTop: menu.bottom + 19,
    });
    wx.showLoading({ title: "加载中...", mask: true });
    await this.drawPhoto(photoUrl);
    wx.hideLoading();
  },

  async drawPhoto(photoUrl) {
    const res = await new Promise((resolve) => {
      wx.createSelectorQuery()
        .select("#canvas")
        .fields({
          node: true,
          size: true,
        })
        .exec((els) => resolve(els[0]));
    });
    const canvas = res.node;
    const ctx = canvas.getContext("2d");
    const { width, height } = res;
    canvas.width = width;
    canvas.height = height;

    // 海报相框image
    const frameImg = canvas.createImage();
    await new Promise((resolve) => {
      frameImg.onload = resolve;
      frameImg.src = "../../assets/photo/poster-frame.png";
    });

    // 照片image
    const photoImg = canvas.createImage();
    await new Promise((resolve) => {
      photoImg.onload = resolve;
      photoImg.src = decodeURIComponent(photoUrl);
    });
    // 照片展示的高度
    let photoHeight = photoImg.height;
    // 照片展示的宽度
    let photoWidth = photoImg.width;
    // 画布的宽高比
    const ratio = width / height;
    if (photoImg.height * ratio < width) {
      // 比frame窄, 截取高度
      photoHeight = photoHeight - (photoHeight - photoWidth * (height / width));
    } else {
      // 比frame宽，截取宽度
      photoWidth = photoWidth - (photoWidth - photoHeight * (width / height));
    }
    // 将照片裁切后画入canvas
    ctx.drawImage(
      photoImg,
      (photoImg.width - photoWidth) / 2,
      (photoImg.height - photoHeight) / 2,
      photoWidth,
      photoHeight,
      0,
      0,
      width,
      height
    );
    // 将相框画入canvas
    ctx.drawImage(
      frameImg,
      0,
      0,
      frameImg.width,
      frameImg.height,
      0,
      0,
      width,
      height
    );

    await new Promise((resolve) => {
      setTimeout(resolve, 500);
    });

    const pic = await new Promise((resolve) => {
      wx.canvasToTempFilePath({
        fileType: "jpg",
        canvas,
        success: (res) => {
          resolve(res.tempFilePath);
        },
        fail: (e) => {
          console.warn("生成图像失败", e);
        },
      });
    });
    this.setData({
      photo: pic,
    });
  },

  async save() {
    const userAuth = await setAuth(
      "scope.writePhotosAlbum",
      "相册权限被拒绝",
      "保存照片需要您授予相册权限"
    );
    if (!userAuth) {
      return wx.showToast({ title: "保存照片失败, 需要相机权限", icon: none });
    }
    wx.saveImageToPhotosAlbum({
      filePath: this.data.photo,
      success() {
        wx.showToast({ title: "保存照片成功" });
      },
      fail(e) {
        console.error("保存照片失败", e);
        wx.showToast({ title: "保存照片失败", icon: none });
      },
    });
  },

  retake() {
    wx.navigateBack();
  },

  onShareAppMessage() {
    return this.shareInfo;
  },
});
