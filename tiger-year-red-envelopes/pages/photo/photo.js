// pages/photo/photo.js
Page({
    data: {
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

    onLoad(options) {
        this.setData({
            tempUrl: options.photoPath
        })
    },

    async onReady() {
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

        wx.hideLoading()

        // 在canvas上生成海报后，转成image能使用的链接
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
            fail(e) {}
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
        wx.navigateBack()
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
})