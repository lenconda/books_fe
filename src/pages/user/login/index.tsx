import { Checkbox, Form, Input, Button, message } from 'antd';
import React, { useState } from 'react';
import { Link, history } from 'umi';
import { Base64 } from 'js-base64';
import logo from '@/assets/logo.svg';
import { Store } from 'antd/es/form/interface';
import styles from './styles.less';
import { request } from '@/utils';

const useForm = Form.useForm;

const Login: React.FC<{}> = () => {
  const [submitting, setSubmitting] = useState(false);

  const [autoLogin, setAutoLogin] = useState(true);
  const [form] = useForm();

  const handleSubmit = async (values: Store) => {
    setSubmitting(true);
    try {
      const res = await request.post('/api/auth/login', values);

      if (res.data.data.token) {
        localStorage.setItem('token', res.data.data.token);
      }

      const encodedRedirectPath = history.location.query.redirect || '';

      if (encodedRedirectPath) {
        const redirectPath = Base64.decode(encodedRedirectPath);
        history.push(redirectPath);
      } else {
        history.push('/');
      }
    } catch (error) {
      message.error('登录失败，请重试！');
    }
    setSubmitting(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.top}>
          <div className={styles.header}>
            <Link to="/">
              <img alt="logo" className={styles.logo} src={logo} />
              <span className={styles.title}>Books</span>
            </Link>
          </div>
          <div className={styles.desc}>南昌大学计算机专业 2019～2020 专业实训大作业 &copy; 彭瀚林</div>
        </div>

        <div className={styles.main}>
          <Form form={form} onFinish={handleSubmit}>
            <>
              <div>
                <Form.Item
                  name="username"
                  rules={[
                    {
                      required: true,
                      message: '请输入管理员账户',
                    },
                  ]}
                >
                  <Input placeholder="请输入管理员账户" />
                </Form.Item>
                <Form.Item
                  name="password"
                  rules={[
                    {
                      required: true,
                      message: '请输入管理员密码',
                    },
                  ]}
                >
                  <Input placeholder="请输入管理员密码" type="password" />
                </Form.Item>
              </div>
              <div>
                <Checkbox checked={autoLogin} onChange={(e) => setAutoLogin(e.target.checked)}>
                  使我保持登录状态
                </Checkbox>
                <a
                  style={{
                    float: 'right',
                  }}
                >
                  忘记密码
                </a>
              </div>
              <Button className="submit" loading={submitting} block type="primary" htmlType="submit">登录</Button>
            </>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Login;
