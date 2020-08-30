import React from 'react';
import { BasicLayoutProps, Settings as LayoutSettings } from '@ant-design/pro-layout';
import { history, Location } from 'umi';
import RightContent from '@/components/RightContent';
import Footer from '@/components/Footer';

import defaultSettings from '../config/defaultSettings';
import { request } from './utils';

export async function getInitialState(): Promise<{
  settings?: LayoutSettings;
}> {
  // 如果是登录页面，不执行
  if (history.location.pathname !== '/user/login') {
    try {
      await request.get('/api/auth/check');
      return {
        settings: defaultSettings,
      };
    } catch (error) {
      history.push('/user/login');
    }
  }
  return {
    settings: defaultSettings,
  };
}

export const layout = ({
  initialState,
}: {
  initialState: { settings?: LayoutSettings };
}): BasicLayoutProps => {
  history.listen((data: Location) => {
    if (data.pathname !== '/user/login') {
      request.get('/api/auth/check');
    }
  });

  return {
    rightContentRender: () => <RightContent />,
    disableContentMargin: false,
    footerRender: () => <Footer />,
    menuHeaderRender: undefined,
    ...initialState?.settings,
  };
};
