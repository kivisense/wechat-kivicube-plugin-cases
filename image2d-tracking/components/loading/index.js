Component({
  properties: {
    progress: 0,
  },
  data: {
    percent: 0,
    posX: 0,
    posY: 0,
  },
  observers: {
    progress: function () {
      const imageWidth = 58.67;
      const r = imageWidth / 2;
      const percent = parseInt(this.properties.progress);
      const posX = Math.sin((percent / 50) * Math.PI) * r;
      const posY = (1 - Math.cos((percent / 50) * Math.PI)) * r;
      this.setData({
        posX,
        posY,
        percent,
      });
    },
  },
});
