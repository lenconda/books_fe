// https://umijs.org/config/
import { defineConfig } from 'umi';
import defaultSettings from './defaultSettings';
import proxy from './proxy';

const { REACT_APP_ENV } = process.env;

export default defineConfig({
  hash: true,
  antd: {},
  dva: {
    hmr: true,
  },
  layout: {
    name: 'Books',
    locale: false,
    siderWidth: 208,
  },
  locale: {
    // default zh-CN
    default: 'zh-CN',
    // // default true, when it is true, will use `navigator.language` overwrite default
    antd: false,
    baseNavigator: false,
  },
  dynamicImport: {
    loading: '@/components/PageLoading/index',
  },
  targets: {
    ie: 11,
  },
  // umi routes: https://umijs.org/docs/routing
  routes: [
    {
      path: '/user',
      layout: false,
      routes: [
        {
          name: 'login',
          path: '/user/login',
          component: './user/login',
        },
      ],
    },
    {
      path: '/dashboard',
      name: '控制台',
      icon: 'dashboard',
      component: './dashboard',
    },
    {
      path: '/books',
      name: '图书管理',
      icon: 'book',
      component: './books',
    },
    {
      path: '/books/settlein',
      name: '新书入库',
      component: './books/settlein',
      hideInMenu: true,
    },
    {
      path: '/readers',
      name: '读者管理',
      icon: 'user',
      component: './readers',
    },
    {
      path: '/readers/info',
      name: '读者登记',
      component: './readers/info',
      hideInMenu: true,
    },
    {
      path: '/borrowing_records',
      name: '借阅管理',
      icon: 'container',
      component: './borrowing_records',
    },
    {
      path: '/borrowing_records/detail',
      name: '借阅详情',
      component: './borrowing_records/detail',
      hideInMenu: true,
    },
    {
      path: '/borrowing_records/borrow',
      name: '借阅登记',
      component: './borrowing_records/borrow',
      hideInMenu: true,
    },
    {
      path: '/',
      redirect: '/dashboard',
    },
    {
      component: './404',
    },
  ],
  // Theme for antd: https://ant.design/docs/react/customize-theme-cn
  theme: {
    // ...darkTheme,
    'primary-color': defaultSettings.primaryColor,
  },
  // @ts-ignore
  title: false,
  ignoreMomentLocale: true,
  proxy: proxy[REACT_APP_ENV || 'dev'],
  manifest: {
    basePath: '/',
  },
});
