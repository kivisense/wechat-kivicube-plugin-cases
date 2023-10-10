function getPrivate() {
  if (wx.requirePrivacyAuthorize) {
    return new Promise((resolve, reject) => {
      wx.requirePrivacyAuthorize({
        success: (res) => {
          console.log("用户同意了隐私协议");
          resolve(res);
        },
        fail: (res) => {
          reject(res);
          console.log("用户拒绝了隐私协议");
        },
      });
    });
  } else {
    return Promise.resolve();
  }
}

Page({
  data: {
    showVideo: false,
    showChooseBtn: false,
    // 胶囊按钮高度
    menuButtonHeight: "32px",
    // 胶囊按钮位置
    capsuleTop: "48px",
  },

  onLoad() {
    wx.loadFontFace({
      family: "PangMenZhengDao",
      source:
        'url("https://kivicube-resource.kivisense.com/projects/solar-divine-bird-mp/fonts/PangMenZhengDaoBiaoTiTi.ttf")',
      fail(e) {
        wx.showToast({
          title: "字体文件加载失败",
          icon: "none",
          duration: 1000,
        });
        console.error(e);
      },
    });
    //设置左上角按钮的位置和高度
    const { top: capsuleTop, height: capsuleHeight } =
      wx.getMenuButtonBoundingClientRect();

    this.setData({
      menuButtonHeight: capsuleHeight + "px",
      capsuleTop: capsuleTop + "px",
    });
  },

  videoPlay() {
    this.setData({
      showVideo: true,
    });
  },

  async showChooseBtn() {
    try {
    	await getPrivate();
	  	this.setData({
			  showChooseBtn: true,
	  	});
    } catch (error) {
      console.log(error);
    }
  },
  hideChooseBtn() {
    this.setData({
      showChooseBtn: false,
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
