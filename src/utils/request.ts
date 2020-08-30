/* eslint-disable no-param-reassign */

import axios from 'axios';
import { message } from 'antd';
import { history } from 'umi';
import { Base64 } from 'js-base64';

axios.defaults.timeout = 3600000;

axios.interceptors.request.use(config => {
  config.headers = {
    Authorization:
        `${localStorage.getItem('token') || sessionStorage.getItem('token')}`,
  };
  return config;
});

axios.interceptors.response.use(response => {
  if (
    response.data.data
    && Object.prototype.toString.call(response.data.data) === '[object String]'
  ) {
    message.info(response.data.data);
  }

  if (response.data.data && response.data.data.token) {
    localStorage.setItem('token', response.data.data.token);
  }

  return response;
}, error => {
  if (error.response.status === 401) {
    const { pathname = '', search = '', hash = '' } = history.location;
    if (pathname !== '/user/login') {
      history.push(`/user/login?redirect=${Base64.encode(`${pathname}${search}${hash}`)}`);
    }
  } else {
    if (error.response.data.message) {
      message.error(error.response.data.message);
    }
  }
});

export const request = axios;
