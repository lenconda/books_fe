import React, { useEffect, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Card, Table, Button, Typography, Popconfirm, Form, Input } from 'antd';
import { request } from '@/utils';
import { history } from 'umi';

export default (): React.ReactNode => {
  const [bookItems, setBookItems] = useState<object[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [form] = Form.useForm();

  const { location } = history;

  const queryBooks = (page: number = 1, size: number = 10, query = {}) => {
    setLoading(true);
    request.post('/api/book/all', { query, page, size }).then(res => {
      const { items = [], total = 0 } = res.data.data || {};
      setBookItems(items);
      setTotal(total);
    }).finally(() => setLoading(false));
  }

  const deleteBook = (isbn: string) => {
    request.delete(`/api/book/${isbn}`).finally(() => queryBooks());
  };

  useEffect(() => {
    const { query } = location;
    const { page = '1', size = '10' } = query;
    const queryMap = ['name', 'isbn', 'publisher']

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
    queryBooks(parseInt(page), parseInt(size), queryParams);
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

  const handleQueryBooks = (values: any) => {
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
      title: '书名',
      dataIndex: 'name',
      width: 200,
      key: 'name',
    },
    {
      title: 'ISBN',
      dataIndex: 'isbn',
      width: 200,
      key: 'isbn',
    },
    {
      title: '作者',
      dataIndex: 'author',
      width: 100,
      key: 'author',
    },
    {
      title: '出版社',
      dataIndex: 'publisher',
      width: 200,
      key: 'publisher',
      render: (text: string, record: any) => record['publisher'] || '-',
    },
    {
      title: '发行日期',
      dataIndex: 'publish_date',
      width: 200,
      key: 'publish_date',
      render: (text: string, record: any) => record['publish_date']
        ? new Date(Date.parse(record['publish_date'])).toLocaleDateString()
        : '-',
    },
    {
      title: '库存量',
      dataIndex: 'count',
      width: 100,
      key: 'count',
    },
    {
      title: '入库时间',
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
            <Button type="link" onClick={() => history.push(`/books/settlein?isbn=${record['isbn']}`)}>编辑</Button>
            <Popconfirm
              title={`确定下架《${record['name']}》的全部库存吗`}
              okText="确定"
              cancelText="取消"
              onConfirm={e => deleteBook(record['isbn'])}
            >
              <Button type="link">
                <Typography.Text type="danger">下架</Typography.Text>
              </Button>
            </Popconfirm>
        </span>
      ),
    },
  ];

  return (
    <PageContainer>
      <Card className="content query">
        <Button type="primary" onClick={() => history.push('/books/settlein')}>新书入库</Button>
        <Form
          form={form}
          layout="inline"
          className="query-wrapper"
          onFinish={handleQueryBooks}
        >
          <Form.Item name="name">
            <Input placeholder="按书名检索" />
          </Form.Item>
          <Form.Item name="isbn">
            <Input placeholder="按 ISBN 检索" />
          </Form.Item>
          <Form.Item name="publisher">
            <Input placeholder="按出版社名称检索" />
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
          rowKey="isbn"
          columns={columns}
          scroll={{ x: 1000 }}
          dataSource={bookItems}
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
