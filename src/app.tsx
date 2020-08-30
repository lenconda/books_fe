import React from 'react';
import { BasicLayoutProps, Settings as LayoutSettings } from '@ant-design/pro-layout';
import { history } from 'umi';
import RightContent from '@/components/RightContent';
import Footer from '@/components/Footer';

import defaultSettings from '../config/defaultSettings';
import { request } from './utils';

export async function getInitialState(): Promise<{
  currentUser?: any;
  settings?: LayoutSettings;
}> {
  const res = await request.get('/api/auth/info');
  const currentUser = res.data.data;
  // 如果是登录页面，不执行
  if (history.location.pathname !== '/user/login') {
    try {
      return {
        currentUser,
        settings: defaultSettings,
      };
    } catch (error) {
      history.push('/user/login');
    }
  }
  return {
    currentUser,
    settings: defaultSettings,
  };
}

export const layout = ({
  initialState,
}: {
  initialState: { settings?: LayoutSettings };
}): BasicLayoutProps => {
  return {
    rightContentRender: () => <RightContent />,
    disableContentMargin: false,
    footerRender: () => <Footer />,
    menuHeaderRender: undefined,
    ...initialState?.settings,
  };
};
