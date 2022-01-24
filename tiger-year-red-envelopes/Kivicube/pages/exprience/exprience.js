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
        //控制红包显示的次数
        isRedEnvelopesShowed: wx.getStorageSync('redEnvelopesShowed'),
        //是否隐藏拍照按钮
        hideTakePhoto: false,
        //是否隐藏海报
        hidePoster: true,
        //kivicube-scene拍照后生成照片的地址
        tempUrl: '',
        //kivicube-scene生成照片的宽和高信息，在生成海报时裁切照片时用到
        picWidth: 0,
        picHeight: 0,
        //canvas的宽度和高度，在生成海报时大量使用(逻辑像素)
        canvasWidth: 0,
        canvasHeight: 0,
        //需要展示的海报的地址，方便保存，base64字符串，生成速度比canvasToTempFilePath快很多
        posterUrl: '',
        //等待保存到相册的海报地址,上面的posterUrl是base64字符串，无法直接用wx.saveImageToPhotosAlbum()保存到相册，所以生成一个保存图片用的url
        unSavedUrl: '',
        //获取并保存设备像素比
        dpr: wx.getSystemInfoSync().pixelRatio,
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
        //返回首页后再次进入ar页面必须再次获得本地存储的情况
        this.setData({
            isRedEnvelopesShowed: wx.getStorageSync('redEnvelopesShowed')
        })
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
            if (!this.data.isRedEnvelopesShowed) {
                wx.setStorageSync('redEnvelopesShowed', true)
                this.setData({
                    showRedEnvelopes: true
                })
            }
        }, 5000);
    },


    //生成照片后保存的方法，如果需要自定义生成照片的滤镜，则需要自己定义一个canvas再手动合成
    async photo({
        detail: photoPath
    }) {
        //设置照片地址
        this.setData({
            tempUrl: photoPath
        })

        wx.showLoading({
            title: '拍照中',
        })
        //获取并存储照片的长宽信息（像素值）
        const {
            width,
            height
        } = await wx.getImageInfo({
            src: this.data.tempUrl
        })
        this.setData({
            picWidth: width,
            picHeight: height
        })
        //在canvas上生成海报
        wx.createSelectorQuery()
            .select('#photoCanvas')
            .fields({
                node: true,
                size: true,
            })
            .exec(this.init.bind(this))

        wx.hideLoading()

        //隐藏拍照按钮,显示海报
        this.setData({
            hideTakePhoto: true,
            hidePoster: false
        })
    },

    //生成海报的方法
    async init(res) {
        //获取并存储canvas的大小（逻辑像素）
        const width = res[0].width
        const height = res[0].height
        this.setData({
            canvasWidth: width,
            canvasHeight: height
        })

        //获取并存储canvas实例，在生成海报阶段的wx.canvasToTempFilePath使用
        const canvas = res[0].node
        this.canvas = canvas

        //获取canvas上下文，在生成海报中绘制各种元素时使用
        const ctx = canvas.getContext('2d')

        //设置canvas画布的大小（物理像素）
        canvas.width = width * this.data.dpr
        canvas.height = height * this.data.dpr

        //设置逻辑像素到物理像素的放大比例
        ctx.scale(this.data.dpr, this.data.dpr)

        //生成海报背景图片
        const bgImg = await this.loadImg(canvas, '/asset/poster-bg.png')
        ctx.drawImage(bgImg, 0, 0, this.data.canvasWidth, this.data.canvasHeight)

        //生成海报内容图
        let img = await this.loadImg(canvas, this.data.tempUrl)
        let imgTotalHeight = this.data.picWidth / 59.07 * 92.77
        let imgStartY = (this.data.picHeight - imgTotalHeight) / 2
        ctx.drawImage(img, 0, imgStartY, this.data.picWidth, imgTotalHeight, this.data.canvasWidth / 100 * 5.65, this.data.canvasWidth / 100 * 16.77, this.data.canvasWidth / 100 * 88.6, this.data.canvasWidth / 100 * 139.14)

        //生成二维码
        let qrcode = await this.loadImg(canvas, '/asset/qrcode.png')
        ctx.drawImage(qrcode, this.data.canvasWidth / 100 * 68.9, this.data.canvasWidth / 100 * 159.45, this.data.canvasWidth / 100 * 21.04, this.data.canvasWidth / 100 * 21.34)

        //生成kivisense的logo
        let logo = await this.loadImg(canvas, '/asset/logo.png')
        ctx.drawImage(logo, this.data.canvasWidth / 100 * 26.22, this.data.canvasWidth / 100 * 7.32, this.data.canvasWidth / 100 * 46.04, this.data.canvasWidth / 100 * 4.57)

        //生成文本
        ctx.fillStyle = "#feeca3"
        ctx.font = `normal 700 ${this.data.canvasWidth / 100 * 6.1}px PingFangSC-Semibold`
        ctx.fillText('AR虎娃贺新春', this.data.canvasWidth / 100 * 8.23, this.data.canvasWidth / 100 * (161.59 + 6.1))
        ctx.font = `normal 400 ${this.data.canvasWidth / 100 * 4.57}px PingFangSC`
        ctx.fillText('即刻体验，领取红包封面', this.data.canvasWidth / 100 * 8.23, this.data.canvasWidth / 100 * (161.59 + 6.1 + 8.54))

        const url = canvas.toDataURL()

        this.setData({
            posterUrl: url,
            hidePoster: false,
            canTakePhoto: true
        })

        // 在canvas上生成海报后，转成能存储到本地相册链接
        wx.canvasToTempFilePath({
            x: 0,
            y: 0,
            width: this.data.canvasWidth,
            height: this.data.canvasHeight,
            destWidth: this.data.canvasWidth * this.data.dpr,
            destHeight: this.data.canvasHeight * this.data.dpr,
            canvas: this.canvas,
            success: (res) => {
                this.setData({
                    unSavedUrl: res.tempFilePath,
                })
            },
            fail(e) { }
        })
    },

    loadImg(canvas, imgPath) {
        return new Promise((resolve, reject) => {
            let img = canvas.createImage();
            img.src = imgPath;
            img.onload = e => {
                resolve(img);
            };
            img.onError = e => {
                reject(new Error(e.message + +"(图片路径错误)"));
            };
        });
    },

    rePhoto() {
        this.setData({
            tempUrl: '',
            hidePoster: true,
            hideTakePhoto: false
        })
    },

    savePhoto() {
        wx.getSetting({
            success: (res) => {
                // 如果没有授权
                if (!res.authSetting['scope.writePhotosAlbum']) {
                    // 则拉起授权窗口
                    wx.authorize({
                        scope: 'scope.writePhotosAlbum',
                        success: () => {
                            wx.saveImageToPhotosAlbum({
                                filePath: this.data.unSavedUrl,
                                success: () => {
                                    wx.showToast({
                                        icon: 'none',
                                        title: '照片已保存到相册',
                                        duration: 1000
                                    })
                                }
                            })
                        },
                        fail: (error) => {
                            //点击了拒绝授权后--就一直会进入失败回调函数--此时就可以在这里重新拉起授权窗口
                            wx.showModal({
                                title: '相册权限被拒绝',
                                content: '保存照片需要您授予相册权限',
                                cancelText: '取消',
                                cancelColor: '#999',
                                confirmText: '去授权',
                                confirmColor: '#f94218',
                                success: (res) => {
                                    if (res.confirm) {
                                        // 选择弹框内授权
                                        wx.openSetting({
                                            success: (res) => {
                                                if (res.authSetting['scope.writePhotosAlbum']) {
                                                    wx.saveImageToPhotosAlbum({
                                                        filePath: this.data.unSavedUrl,
                                                        success: () => {
                                                            wx.showToast({
                                                                icon: 'none',
                                                                title: '照片已保存到相册',
                                                                duration: 1000
                                                            })
                                                        }
                                                    })
                                                } else {
                                                    return
                                                }
                                            }
                                        })
                                    } else if (res.cancel) {
                                        // 选择弹框内 不授权
                                        ('用户点击不授权')
                                        //跳转
                                        return
                                    }
                                }
                            })
                        }
                    })
                } else {
                    // 有权限则直接存
                    wx.saveImageToPhotosAlbum({
                        filePath: this.data.unSavedUrl,
                        success: () => {
                            wx.showToast({
                                icon: 'none',
                                title: '照片已保存到相册',
                                duration: 1000
                            })
                        }
                    })
                }
            }
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
            fail: (err) => { }
        })
    },
})