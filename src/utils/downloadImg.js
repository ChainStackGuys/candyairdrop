/**
 * @desc   下载图片
 * @param  {string} src 图片地址
 * @return {DOM Element} 图片元素
 */
export default (src) => {
  return new Promise((resolve, reject) => {
    let img = new Image()
    img.setAttribute('crossOrigin', 'Anonymous')
    img.onload = () => {
      resolve(img)
    }
    img.onerror = err => {
      reject(new Error(`图片加载失败:${err}`))
    }
    img.src = src
  })
}
