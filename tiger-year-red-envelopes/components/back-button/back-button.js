Component({
    /**
     * 组件的属性列表
     */
    properties: {

    },

    /**
     * 组件的初始数据
     */
    data: {
        // // 胶囊按钮高度
        menuButtonHeight: wx.getStorageSync('menuButtonHeight') + 'px',
        // // 左边返回按钮距屏幕顶部的距离
        capsuleTop: wx.getStorageSync('capsuleTop') + 'px'
    },
    methods: {
        async goBack() {
            try {
                await wx.navigateBack()
            } catch (error) {
                wx.navigateTo({
                    url: '/pages/index/index',
                })
            }
        },
    }
})