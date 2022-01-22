// app.js
App({
  onLaunch() {
    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })

    //全局注册监听内存警告事件，内存警告事件会导致当前页面reload，从而导致webgl渲染出错。在发生内存警告事件后，记录这个信息，在页面再次onShow时根据这个信息确定是否重建kivicube-sense组件
    wx.onMemoryWarning(function () {
      wx.setStorageSync('reloaded', true)
    })

    const {
      statusBarHeight,
      platform
    } = wx.getSystemInfoSync()
    const {
      top,
      height
    } = wx.getMenuButtonBoundingClientRect()

    // 状态栏高度
    wx.setStorageSync('statusBarHeight', statusBarHeight)
    // 胶囊按钮高度 一般是32 如果获取不到就使用32
    wx.setStorageSync('menuButtonHeight', height ? height : 32)

    // 判断胶囊按钮信息是否成功获取
    if (top && top !== 0 && height && height !== 0) {
      wx.setStorageSync('capsuleTop', top)
      const navigationBarHeight = (top - statusBarHeight) * 2 + height
      // 导航栏高度
      wx.setStorageSync('navigationBarHeight', navigationBarHeight)
    } else {
      wx.setStorageSync(
        'navigationBarHeight',
        platform === 'android' ? 48 : 40
      )
    }
  }
})