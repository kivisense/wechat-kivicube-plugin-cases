export function promisify(fn, context) {
  return config => {
    return new Promise((resolve, reject) => {
      fn.call(context || wx, {
        ...config,
        success: resolve,
        fail: reject
      });
    });
  };
}