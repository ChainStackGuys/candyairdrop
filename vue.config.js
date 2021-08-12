const appName = process.env.VUE_APP_APPNAME
const cdnDomain = process.env.CDN_DOMAIN || ''
const staticDir = `static_${appName}`
const buildDir = process.env.BUILD_DIR
const devServerPort = +process.env.DEV_SERVER_PORT || 8080 // dev 端口号
const usePrefetch = process.env.USE_PREFETCH === '0' ? 0 : 1 // 是否启用 chunk prefetch
const productionSourceMap = process.env.PRODUCTION_SOURCE_MAP === '0' ? false : true // 是否启用source map

const path = require('path')

module.exports = {
  // 部署应用包时的基本 URL
  publicPath: process.env.NODE_ENV === 'production' ? `/dappprize` : undefined,

  // 生产环境构建文件的目录
  outputDir: path.resolve(__dirname, `${buildDir}`),

  // 指定生成的 index.html 的输出路径 (相对于 outputDir)。也可以是一个绝对路径
  indexPath: path.resolve(__dirname, `${buildDir}/index.html`),

  devServer: {
    disableHostCheck: true, // 禁用域名检测 https://webpack.js.org/configuration/dev-server/#devserver-disablehostcheck
    port: devServerPort, // can be overwritten by process.env.PORT, if port is in use, a free one will be determined
    /*proxy: {
      '/api': {
        target: 'https://api.bitcv.net', // 线上环境
        changeOrigin: true
      }
    }*/
  },

  productionSourceMap,
  chainWebpack: config => {
    // 根据 env 判断是否移除 prefetch 插件
    if (!usePrefetch) {
      config.plugins.delete('prefetch')
    }
  },
  pluginOptions: {
    'style-resources-loader': {
      preProcessor: 'scss',
      patterns: [path.resolve(__dirname, 'src/assets/scss/_mixins*.scss')]
    }
  }
}
