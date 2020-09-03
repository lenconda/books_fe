import React, { useEffect, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Card, Table, Button, Form, Input, Typography, DatePicker, Popconfirm } from 'antd';
import { request } from '@/utils';
import { history } from 'umi';
import styles from './styles.less';
import moment from 'moment';

const { Text } = Typography;
const { RangePicker } = DatePicker;

export default (): React.ReactNode => {
  const [borrowingRecordItems, setBorrowingRecordItems] = useState<object[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [form] = Form.useForm();

  const { location } = history;

  const queryBorrowingRecords = (page: number = 1, size: number = 10, query = {}) => {
    setLoading(true);
    request.post('/api/record/all', { query, page, size }).then(res => {
      const { items = [], total = 0 } = res.data.data || {};
      setBorrowingRecordItems(items);
      setTotal(total);
    }).finally(() => setLoading(false));
  }

  const fetchAllRecords = () => {
    const { query } = location;
    const { page = '1', size = '10' } = query;

    const queryParams = ['uuid', 'book', 'reader', 'return_date', 'created_at'].reduce((res, key) => {
      if (!!query[key]) {
        if (key === 'return_date' || key === 'created_at') {
          res[key] = query[key].split('__');
        } else {
          res[key] = query[key];
        }
      }
      return res;
    }, {});

    const formQueryParams = ['uuid', 'book', 'reader', 'return_date', 'created_at'].reduce((res, key) => {
      if (!!query[key]) {
        if (key === 'return_date' || key === 'created_at') {
          res[key] = query[key].split('__').map((time: string) => moment(time));
        } else {
          res[key] = query[key];
        }
      } else {
        res[key] = '';
      }
      return res;
    }, {});

    form.setFieldsValue(formQueryParams);
    queryBorrowingRecords(parseInt(page), parseInt(size), queryParams);
  }

  useEffect(() => {
    fetchAllRecords();
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

  const handleQueryBorrowingRecords = (values: any) => {
    const query = Object.keys(values).reduce((res, key) => {
      if (values[key] !== undefined) {
        if (Array.isArray(values[key]) && values[key].length === 2) {
          res[key] = [
            values[key][0].toISOString(),
            values[key][1].toISOString(),
          ].join('__');
        } else {
          res[key] = values[key] || '';
        }
      }
      return res;
    }, {});
    const { query: routeQuery, pathname } = location;
    const { size = 10 } = routeQuery;
    const a = {
      ...routeQuery,
      ...query,
      page: 1,
      size,
    };
    console.log(a);

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

  const handleConfirmReturnBook = (uuid: string) => {
    request.delete(`/api/record/${uuid}`).then(res => {
      if (res) {
        fetchAllRecords();
      }
    })
  }

  const columns = [
    {
      title: 'UUID',
      dataIndex: 'uuid',
      width: 120,
      key: 'uuid',
    },
    {
      title: '归还日期',
      dataIndex: 'return_date',
      width: 200,
      key: 'return_date',
      render: (text: string, record: any) => new Date(Date.parse(record['return_date'])).toLocaleString(),
    },
    {
      title: '是否归还',
      dataIndex: 'returned',
      width: 100,
      key: 'returned',
      render: (text: string, record: any) => {
        const returned = record['returned'];

        if (returned === 0) {
          if (new Date(Date.parse(record['return_date'])).valueOf() >= Date.now()) {
            return <Text type="warning">未归还</Text>;
          } else {
            return <Text type="danger">已逾期</Text>;
          }
        } else if (returned === 1) {
          return <Text type="success">已归还</Text>
        } else {
          return '';
        }
      },
    },
    {
      title: '借阅人姓名',
      width: 200,
      key: 'reader__name',
      render: (text: string, record: any) => record.reader.name || '',
    },
    {
      title: '借阅人身份证号',
      width: 200,
      key: 'reader__id_card',
      render: (text: string, record: any) => record.reader.id_card || '',
    },
    {
      title: '借阅人联系电话',
      width: 150,
      key: 'reader__phone',
      render: (text: string, record: any) => record.reader.phone || '',
    },
    {
      title: '书名',
      width: 200,
      key: 'book__name',
      render: (text: string, record: any) => record.book.name || '',
    },
    {
      title: 'ISBN',
      width: 200,
      key: 'book__isbn',
      render: (text: string, record: any) => record.book.isbn || '',
    },
    {
      title: '借阅时间',
      dataIndex: 'created_at',
      width: 200,
      key: 'created_at',
      render: (text: string, record: any) => new Date(Date.parse(record['created_at'])).toLocaleString(),
    },
    {
      title: '操作',
      width: 100,
      fixed: 'right' as 'right',
      render: (text: string, record: any) => {
        const returnDate = record['return_date'];
        const returned = record['returned'];

        const renderExtra = () => {
          if (returned === 0 && new Date(Date.parse(returnDate)).valueOf() >= Date.now()) {
            return (
              <Popconfirm
                title="确认归还吗"
                okText="确定"
                cancelText="取消"
                onConfirm={() => handleConfirmReturnBook(record['uuid'])}
              >
                <Button type="link">归还</Button>
              </Popconfirm>
            );
          }

          return null;
        }

        return (
          <span>
            {renderExtra()}
            <Button type="link" onClick={() => history.push(`/borrowing_records/detail?uuid=${record['uuid']}`)}>详情</Button>
          </span>
        );
      },
    },
  ];

  return (
    <PageContainer>
      <Card className="content query">
        <Button type="primary" onClick={() => history.push('/borrowing_records/borrow')}>借阅登记</Button>
        <Form
          form={form}
          layout="inline"
          className={styles['query-wrapper']}
          onFinish={handleQueryBorrowingRecords}
        >
          <Form.Item name="uuid">
            <Input placeholder="按借阅单 UUID 检索" />
          </Form.Item>
          <Form.Item name="book">
            <Input placeholder="按图书 ISBN 检索" />
          </Form.Item>
          <Form.Item name="reader">
            <Input placeholder="按借阅者身份证号检索" />
          </Form.Item>
          <Form.Item name="return_date">
            <RangePicker style={{ width: '100%' }} placeholder={['归还时间开始', '归还时间结束']} />
          </Form.Item>
          <Form.Item name="created_at">
            <RangePicker style={{ width: '100%' }} placeholder={['借阅时间开始', '借阅时间结束']} />
          </Form.Item>
          <div style={{ marginTop: 15, width: '100%' }}>
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
          </div>
        </Form>
        <Table
          rowKey="uuid"
          columns={columns}
          scroll={{ x: 1000 }}
          dataSource={borrowingRecordItems}
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
