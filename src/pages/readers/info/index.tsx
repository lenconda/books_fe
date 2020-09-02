import React, { useEffect, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Card, Form, Input, Button, Select, InputNumber } from 'antd';
import { request } from '@/utils';
import { history } from 'umi';
// import styles from './styles.less';

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const tailLayout = {
  wrapperCol: { offset: 8, span: 16 },
};

export default (): React.ReactNode => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);

  const { location } = history;
  const { query } = location;

  const handleSubmitReader = (values: any) => {
    const data = Object.keys(values).reduce((res, key) => {
      res[key] = values[key] || null;
      return res;
    }, {});

    let handler;

    if (query.id_card) {
      handler = () => request.patch(`/api/reader/${query.id_card}`, data);
    } else {
      handler = () => request.post('/api/reader/add', data);
    }

    handler().then(res => history.push('/readers'));
  };

  const setReaderFieldsValues = (id_card: string) => {
    setLoading(true);
    request.get(`/api/reader/${id_card}`).then(res => {
      const fieldsValues = res.data.data || {};
      form.setFieldsValue(fieldsValues);
    }).finally(() => setLoading(false));
  }

  useEffect(() => {
    if (query.id_card) {
      setReaderFieldsValues(query.id_card);
    }
  }, [query]);

  return (
    <PageContainer>
      <Card loading={loading}>
        <Form
          {...layout}
          form={form}
          name="basic"
          initialValues={{ remember: true }}
          onFinish={handleSubmitReader}
        >
          <Form.Item
            label="姓名"
            name="name"
            rules={[{ required: true, message: '请输入读者姓名' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="身份证号"
            name="id_card"
            rules={[{ required: true, message: '请输入读者身份证号' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="电话号码" name="phone">
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="住址" name="address">
            <Input />
          </Form.Item>
          <Form.Item label="性别" name="gender">
            <Select>
              <Select.Option value={0}>男</Select.Option>
              <Select.Option value={1}>女</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item {...tailLayout}>
            <Button htmlType="submit" type="primary">确定</Button>
            <Button style={{ marginLeft: 10 }} onClick={() => history.goBack()}>取消</Button>
          </Form.Item>
        </Form>
      </Card>
    </PageContainer>
  );
}
