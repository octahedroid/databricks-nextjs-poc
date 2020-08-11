module.exports = {
  exportTrailingSlash: true,
  cssModules: true,
  exportPathMap: function() {
    return {
      '/': { page: '/' },
      '/careers': { page: '/careers' }
    };
  }
};