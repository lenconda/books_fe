import React, { useEffect, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Card, Form, Input, Button, DatePicker } from 'antd';
import { request } from '@/utils';
import moment from 'moment';
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

  const onFinish = (values: any) => {
    const data = Object.keys(values).reduce((res, key) => {
      if (key === 'publish_date' && values[key]) {
        res[key] = moment.utc(values[key]).toISOString();
        return res;
      }
      res[key] = values[key] || null;
      return res;
    }, {});

    let handler;

    if (query.isbn) {
      handler = () => request.patch(`/api/book/${query.isbn}`, data);
    } else {
      handler = () => request.post('/api/book/add', data);
    }

    handler().then(res => history.push('/books'));
  };

  const setBookFieldsValues = (isbn: string) => {
    setLoading(true);
    request.get(`/api/book/${isbn}`).then(res => {
      const fieldsValues = res.data.data || {};
      fieldsValues['publish_date'] = moment(fieldsValues['publish_date']);
      fieldsValues['created_at'] = moment(fieldsValues['created_at']);
      fieldsValues['updated_at'] = moment(fieldsValues['updated_at']);
      form.setFieldsValue(res.data.data)
    }).finally(() => setLoading(false));
  }

  useEffect(() => {
    if (query.isbn) {
      setBookFieldsValues(query.isbn);
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
          onFinish={onFinish}
        >
          <Form.Item
            label="姓名"
            name="name"
            rules={[{ required: true, message: '请输入图书名称' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="ISBN"
            name="isbn"
            rules={[{ required: true, message: '请输入 ISBN' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="作者"
            name="author"
            rules={[{ required: true, message: '请输入作者' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="出版社"
            name="publisher"
            rules={[{ required: true, message: '请输入出版社' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="库存总量"
            name="count"
            rules={[{ required: true, message: '请输入库存总量' }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            label="发行日期"
            name="publish_date"
          >
            <DatePicker
              bordered={false}
              placeholder="请选择发行日期"
              style={{ width: '100%' }}
              disabledDate={date => moment(date).valueOf() > Date.now()}
            />
          </Form.Item>
          <Form.Item
            label="图书封面 URL"
            name="cover"
          >
            <Input />
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
