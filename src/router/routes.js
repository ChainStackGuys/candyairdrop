const getView = path => {
  return () => import('@/views/' + path + '.vue')
}

// auth 权限
const NoAuth = 0 // 不需要登录
// const AnonymousUser = 1 // 匿名登录，如微信登录
const FormalUser = 2 // 正式登录

/*
 * meta 字段说明
 * title: 网页标题 路由中自动动态配置
 * authLevel: 页面需要的访问权限
 */

export default [
  {
    path: '/:lang/prizeSend',
    component: getView('prizeSend'),
    meta: {
      title: 'text.page_title_prizeSend', // 发红包
      authLevel: FormalUser
    }
  },
  {
    path: '/:lang/prizeShare',
    component: getView('prizeShare'),
    meta: {
      title: 'text.page_title_prizeShare', // 分享红包
      authLevel: NoAuth
    }
  },
  {
    path: '/:lang/sharePoster',
    component: getView('sharePoster'),
    meta: {
      title: 'text.page_title_prizeShare', // 分享红包海报
      authLevel: FormalUser
    }
  },
  {
    path: '/:lang/prizeOpen',
    component: getView('prizeOpen'),
    meta: {
      title: 'text.page_title_prizeOpen', // 开红包
      authLevel: NoAuth
    }
  },
  {
    path: '/:lang/prizeDetail',
    component: getView('prizeDetail'),
    meta: {
      title: 'text.page_title_prizeDetail', // 红包详情
      authLevel: FormalUser
    }
  },

  {
    path: '/:lang/recordSend',
    component: getView('recordSend'),
    meta: {
      title: 'text.page_title_prizeRecord', // 红包记录
      authLevel: FormalUser
    }
  },
  {
    path: '/:lang/recordOpen',
    component: getView('recordOpen'),
    meta: {
      title: 'text.page_title_prizeRecord', // 红包记录
      authLevel: FormalUser
    }
  },
  {
    path: '/:lang/login',
    component: getView('login'),
    meta: {
      title: 'text.page_title_bindMobile', // 绑定手机号并登录
      authLevel: NoAuth
    }
  },

  {
    path: '/:lang/thirdLogin',
    component: getView('thirdLogin'),
    meta: {
      title: 'text.page_title_login', // 登录中...
      authLevel: NoAuth
    }
  },

  {
    path: '*',
    redirect: '/cn/prizeSend'
  }
]
