module.exports = {
  reactStrictMode: true,
  async redirects() {
    return [{
      source: '/',
      destination: '/scries',
      permanent: false
    }];
  }
}
