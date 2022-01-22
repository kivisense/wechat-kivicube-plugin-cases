// 当分包使用此插件时，必须在使用组件前，调用此方法，设置分包路径。
// 插件版本>=1.5.5支持

const {
    setPackageRootPath
} = requirePlugin("kivicube");
setPackageRootPath("Kivicube");


Page({
    data: {
        //是否显示loading页面，在进入页面时显示，在kivicube-scene场景加载完成后（loadSceneEnd）关闭
        showCustomDownload: true,
        //判断是否加载kivicube-scene,因为kivicube-scene需要摄像机权限，所以获取摄像机权限后再加载整个kivicube-scene组件
        showKiviScene: false,
        //是否显示领取红包封面
        showRedEnvelopes: false,
    },

    onLoad: function () {
        //拉取摄像头权限的流程
        wx.getSetting({
            success: (res) => {
                // 如果没有授权
                if (!res.authSetting['scope.camera']) {
                    // 则拉起授权窗口
                    wx.authorize({
                        scope: 'scope.camera',
                        success: () => {
                            this.setData({
                                showKiviScene: true
                            })
                        },
                        fail: (error) => {
                            //点击了拒绝授权后--就一直会进入失败回调函数--此时就可以在这里重新拉起授权窗口
                            wx.showModal({
                                title: '摄像头权限被拒绝',
                                content: 'AR体验需要您授予摄像头权限',
                                cancelText: '取消',
                                cancelColor: '#999',
                                confirmText: '去授权',
                                confirmColor: '#f94218',
                                success: (res) => {
                                    if (res.confirm) {
                                        // 选择弹框内授权
                                        wx.openSetting({
                                            success: (res) => {
                                                if (res.authSetting['scope.camera']) {
                                                    this.setData({
                                                        showKiviScene: true
                                                    })
                                                } else {
                                                    wx.navigateBack()
                                                }
                                            }
                                        })
                                    } else if (res.cancel) {
                                        // 选择弹框内 不授权
                                        //跳转
                                        wx.navigateBack()
                                    }
                                }
                            })
                        }
                    })
                } else {
                    // 有权限则直接获取
                    this.setData({
                        showKiviScene: true
                    })
                }
            }
        })
    },

    onShow() {
        //判断是否重新加载
        let reloaded = wx.getStorageSync('reloaded')
        if (reloaded) {
            this.setData({
                showKiviScene: false
            })
            setTimeout(() => {
                this.setData({
                    showKiviScene: true
                })
                wx.setStorageSync('reloaded', false)
            }, 0);
        }
        //页面常亮
        wx.setKeepScreenOn({
            keepScreenOn: true
        })
    },

    //场景加载完成后才关闭loading页面
    loadSceneEnd() {
        this.setData({
            showCustomDownload: false
        })
    },

    //如果跳过云识别，直接进入这个函数；如果没跳过云识别，在扫描到识别图时进入这个函数
    sceneStart() {
        //5s后展示领取红包封面的弹窗
        setTimeout(() => {
            this.setData({
                showRedEnvelopes: true
            })
        }, 5000);
    },


    //生成照片后保存的方法，如果需要自定义生成照片的滤镜，则需要自己定义一个canvas再手动合成
    async photo({
        detail: photoPath
    }) {
        wx.showLoading({
            title: '拍照中',
        })
        wx.hideLoading()
        //跳转到海报页面
        wx.navigateTo({
            url: `/pages/photo/photo?photoPath=${photoPath}`,
        })
    },




    //kivicube-scene的binderror事件绑定的函数，用于判定错误信息，
    error(e) {
        const {
            detail
        } = e;
        // 判定是否camera权限问题，是则向用户申请权限。
        if (detail && detail.isCameraAuthDenied) {
            const page = this;
            wx.showModal({
                title: "提示",
                content: "请给予“摄像头”权限",
                success() {
                    wx.openSetting({
                        success({
                            authSetting: {
                                "scope.camera": isGrantedCamera
                            }
                        }) {
                            if (isGrantedCamera) {
                                wx.redirectTo({
                                    url: '/' + page.__route__
                                });
                            } else {
                                wx.showToast({
                                    title: "获取“摄像头”权限失败！",
                                    icon: "none"
                                });
                            }
                        }
                    });
                }
            });
        }
        console.error(detail);
    },

    //分享小程序到微信聊天界面
    onShareAppMessage() {
        return {
            title: 'AR虎娃贺新春',
            path: '/pages/index/index',
            imageUrl: '/asset/share.jpg'
        }
    },
    //分享小程序到朋友圈
    onShareTimeline() {
        return {
            title: 'AR虎娃贺新春',
            path: '/pages/index/index',
            imageUrl: '/asset/share.jpg'
        }
    },

    //领取红包封面
    showRedPackage() {
        wx.showRedPackage({
            url: 'https://support.weixin.qq.com/cgi-bin/mmsupport-bin/showredpacket?receiveuri=abcJqTpylEG&check_type=2#wechat_redirect',
            success: () => {
                this.setData({
                    showRedEnvelopes: false
                })
            },
            fail: (err) => {}
        })
    },
})