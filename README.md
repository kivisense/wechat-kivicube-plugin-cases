## 项目介绍

此项目是小程序使用 kivicube 插件的案例，以后会有更多案例陆续添加。

### 1.tiger-year-red-envelopes 案例

此案例是使用 kivicube 制作自拍滤镜的案例

包括使用高级 api 的版本和未使用高级 api 的版本

```bash
#克隆项目

git clone git@github.com:kivisense/wechat-kivicube-plugin-cases.git

#打开项目

微信开发者工具打开项目文件夹，并修改appid

#添加插件

进入小程序管理平台搜索"wx3bbab3920eabccb2"自行添加插件(推荐)，或点击微信开发者工具调试器控制台中的添加插件

#注意

请务必用手机预览项目，因为目前微信开发者工具无法打开AR页面
```

### 2.solar-divine-bird-mp 案例

此案例是使用 kivicube 制作图像追踪项目的案例

```bash
#克隆项目

git clone git@github.com:kivisense/wechat-kivicube-plugin-cases.git

#打开项目

微信开发者工具打开项目文件夹，并修改appid

#添加插件

进入小程序管理平台搜索"wx3bbab3920eabccb2"自行添加插件(推荐)，或点击微信开发者工具调试器控制台中的添加插件

#注意

请务必用手机预览项目，因为目前微信开发者工具无法打开AR页面
图像追踪的识别图在项目文件夹根目录
```

### 3.image2d-tracking 案例

此案例是使用 kivicube 制作的图像追踪示例小程序。给开发者提供了一个比较完整的示例和流程。

#### 目录说明

```bash
.
|
├── assets                        // 一些素材资源
|
├── components                    // 一些UI组件
│
├── pages                         // 页面
│    ├── index                    // 首页
│    ├── photo                    // 拍照页面
│    ├── scene                    // kivicube-scene场景页面
│
├── utils                         // 一些工具方法
```

---

#### 体验小程序

- 微信小程序搜索 “AR 图像跟踪” 或扫描下方图片右侧的二维码打开示例小程序。

![识别图](./image2d-tracking/marker.png)

- 进入小程序的扫描界面后，扫描图片左侧识别图进行体验。
