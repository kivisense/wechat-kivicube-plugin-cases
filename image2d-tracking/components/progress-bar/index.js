Component({
  options: {
    styleIsolation: "isolated",
  },
  properties: {
    progress: {
      type: Number,
      value: 0,
    },
  },
  data: {
    rotateRight: "",
    rotateLeft: "",
  },
  observers: {
    progress() {
      const progress = parseInt(this.properties.progress);
      const rotateRight = `transform: rotate(${
        progress > 50 ? 180 : (progress / 50) * 180
      }deg)`;
      const rotateLeft = `transform: rotate(${
        progress < 50 ? 0 : ((progress - 50) / 50) * 180
      }deg)`;
      this.setData({
        rotateRight,
        rotateLeft,
      });
    },
  },
});
