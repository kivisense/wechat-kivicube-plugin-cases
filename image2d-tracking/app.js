// app.js
App({
  onLaunch() {
    const { setOptions } = requirePlugin("kivicube");
    setOptions({
      license:
        "AcfdnJWaXQ7aWlDQUmAQYf4reNprZ2unXTafi5NouO0sxIO3Am1bBlT8f9LMNPQW8aQgwaXni0aJ6BbcLdI5FjcQHiXcN7HqZY+IMPOfsf5Qiw9nDGZVcei0we1tawgEmDbzsV22cPK0eWQxFdurJ7gWwcvzIydctviTjsAoVFMiCQ7qs6hME2wb6zX85SoW0Cfb3DF38fhoS98XC1Zmf68cygFPGOhMZoNgW6FASzjehMkZRd6WEfpXjDiZBgsFU7PhLq98jp7fKZOrDz9TpNXDhExn+581JY4+kWDWXbMycD2JaAsqz3N2gewwg1IMZAyFufyoMRwRZrScWKrfoA==",
    });
  },

  globalData: {
    userInfo: null,
  },
});
