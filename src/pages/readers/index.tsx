import React, { useEffect, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Card, Table, Button, Typography, Popconfirm } from 'antd';
import { request } from '@/utils';
import { history } from 'umi';
// import styles from './styles.less';

export const genderMap = {
  '0': '男',
  '1': '女',
};

export default (): React.ReactNode => {
  const [readerItems, setReaderItems] = useState<object[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const queryReaders = (page: number = 1, size: number = 10) => {
    setLoading(true);
    request.post('/api/reader/all', { query: {}, page, size }).then(res => {
      const { items = [], total = 0 } = res.data.data || {};
      setReaderItems(items);
      setTotal(total);
    }).finally(() => setLoading(false));
  }

  const deleteReader = (id_card: string) => {
    request.delete(`/api/reader/${id_card}`).finally(() => queryReaders());
  };

  useEffect(() => {
    queryReaders();
  }, []);

  const handlePaginationChange = (page: number, size: number | undefined) => {
    queryReaders(page, size);
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
      title: '加入时间',
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
              onConfirm={e => deleteReader(record['isbn'])}
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
      <Card className="content">
        <Button type="primary" onClick={() => history.push('/readers/info')}>读者登记</Button>
        <Table
          rowKey="id_card"
          columns={columns}
          scroll={{ x: 1000 }}
          dataSource={readerItems}
          loading={loading}
          pagination={{
            defaultCurrent: 1,
            total,
            onChange: handlePaginationChange
          }}
          style={{ marginTop: 20 }}
        ></Table>
      </Card>
    </PageContainer>
  );
}
