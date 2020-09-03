import React, { useEffect, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Card, Table, Button, Typography, Popconfirm, Form, Input, InputNumber } from 'antd';
import { request } from '@/utils';
import { history } from 'umi';

export const genderMap = {
  '0': '男',
  '1': '女',
};

export default (): React.ReactNode => {
  const [readerItems, setReaderItems] = useState<object[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [form] = Form.useForm();

  const { location } = history;

  const queryReaders = (page: number = 1, size: number = 10, query = {}) => {
    setLoading(true);
    request.post('/api/reader/all', { query, page, size }).then(res => {
      const { items = [], total = 0 } = res.data.data || {};
      setReaderItems(items);
      setTotal(total);
    }).finally(() => setLoading(false));
  }

  const deleteReader = (id_card: string) => {
    request.delete(`/api/reader/${id_card}`).finally(() => queryReaders());
  };

  useEffect(() => {
    const { query } = location;
    const { page = '1', size = '10' } = query;
    const queryMap = ['name', 'id_card', 'phone'];

    const queryParams = queryMap.reduce((res, key) => {
      if (query[key]) {
        res[key] = query[key];
      }
      return res;
    }, {});

    const formQueryParams = queryMap.reduce((res, key) => {
      res[key] = query[key] || '';
      return res;
    }, {});

    form.setFieldsValue(formQueryParams);
    queryReaders(parseInt(page), parseInt(size), queryParams);
  }, [location.query]);

  const handlePaginationChange = (page: number, size: number | undefined) => {
    const pathname = history.location.pathname;
    const query = history.location.query || {};
    history.push({
      pathname,
      query: {
        ...query,
        page,
        size,
      },
    });
  };

  const handleQueryReaders = (values: any) => {
    const query = Object.keys(values).reduce((res, key) => {
      res[key] = values[key] || '';
      return res;
    }, {});
    const { query: routeQuery, pathname } = location;
    const { size = 10 } = routeQuery;
    history.push({
      pathname,
      query: {
        ...routeQuery,
        ...query,
        page: 1,
        size,
      },
    });
  };

  const columns = [
    {
      title: '姓名',
      dataIndex: 'name',
      width: 120,
      key: 'name',
    },
    {
      title: '身份证号',
      dataIndex: 'id_card',
      width: 250,
      key: 'id_card',
    },
    {
      title: '性别',
      dataIndex: 'gender',
      width: 100,
      key: 'gender',
      render: (text: string, record: any) => genderMap[record['gender']],
    },
    {
      title: '电话',
      dataIndex: 'phone',
      width: 200,
      key: 'phone',
    },
    {
      title: '地址',
      dataIndex: 'address',
      width: 300,
      key: 'address',
    },
    {
      title: '登记时间',
      dataIndex: 'created_at',
      width: 200,
      key: 'created_at',
      render: (text: string, record: any) => new Date(Date.parse(record['created_at'])).toLocaleString(),
    },
    {
      title: '最近更新时间',
      dataIndex: 'updated_at',
      width: 200,
      key: 'updated_at',
      render: (text: string, record: any) => new Date(Date.parse(record['updated_at'])).toLocaleString(),
    },
    {
      title: '操作',
      width: 100,
      fixed: 'right' as 'right',
      render: (text: string, record: any) => (
        <span>
            <Button type="link" onClick={() => history.push(`/readers/info?id_card=${record['id_card']}`)}>编辑</Button>
            <Popconfirm
              title={`确定删除读者 ${record['name']}(${record['id_card']}) 的所有信息吗`}
              okText="确定"
              cancelText="取消"
              onConfirm={e => deleteReader(record['id_card'])}
            >
              <Button type="link">
                <Typography.Text type="danger">删除</Typography.Text>
              </Button>
            </Popconfirm>
        </span>
      ),
    },
  ];

  return (
    <PageContainer>
      <Card className="content query">
        <Button type="primary" onClick={() => history.push('/readers/info')}>读者登记</Button>
        <Form
          form={form}
          layout="inline"
          className="query-wrapper"
          onFinish={handleQueryReaders}
        >
          <Form.Item name="name">
            <Input placeholder="按姓名检索" />
          </Form.Item>
          <Form.Item name="id_card">
            <Input placeholder="按身份证号检索" />
          </Form.Item>
          <Form.Item name="phone">
            <InputNumber placeholder="按电话号码检索" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">提交</Button>
            <Button
              style={{ margin: '0 8px' }}
              onClick={() => {
                const { page = 1, size = 10 } = location.query;
                history.push({
                  pathname: location.pathname,
                  query: { page, size }
                });
              }}
            >清空</Button>
          </Form.Item>
        </Form>
        <Table
          rowKey="id_card"
          columns={columns}
          scroll={{ x: 1000 }}
          dataSource={readerItems}
          loading={loading}
          pagination={{
            defaultCurrent: 1,
            current: location.query.page && parseInt(location.query.page) || 1,
            total,
            onChange: handlePaginationChange
          }}
          style={{ marginTop: 20 }}
        ></Table>
      </Card>
    </PageContainer>
  );
}
