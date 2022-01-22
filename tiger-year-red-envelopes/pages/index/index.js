Page({
  data: {
    isShortScreen: wx.getSystemInfoSync().screenWidth / wx.getSystemInfoSync().screenHeight > (375 / 668)
  },
  gotoExprience() {
    wx.navigateTo({
      url: '/Kivicube/pages/exprience/exprience',
    })
  },
  onShareAppMessage() {
    return {
      title: 'AR虎娃贺新春',
      path: '/pages/index/index',
      imageUrl: '/asset/share.png'
    }
  },
  onShareTimeline() {
    return {
      title: 'AR虎娃贺新春',
      path: '/pages/index/index',
      imageUrl: '/asset/share.png'
    }
  },
})