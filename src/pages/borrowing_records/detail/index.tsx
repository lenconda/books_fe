import React, { useEffect, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Card, Table, Button, Popconfirm, Modal, Form, InputNumber, Divider, Descriptions, Badge } from 'antd';
import { request } from '@/utils';
import { history } from 'umi';

export default (): React.ReactNode => {
  const [detail, setDetail] = useState<Record<string, any>>({});
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [payVisible, setPayVisible] = useState<boolean>(false);
  const [form] = Form.useForm();
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);

  const statusMap = {
    'borrowing': {
      title: '未归还',
      icon: 'processing',
    },
    'delayed': {
      title: '已逾期',
      icon: 'error',
    },
    'returned': {
      title: '已归还',
      icon: 'success',
    },
  };

  const getStatus = (return_date: string, returned: number): 'borrowing' | 'delayed' | 'returned' => {
    if (returned === 1) {
      return 'returned';
    }

    const returnDate = new Date(return_date).valueOf();
    if (returnDate < Date.now()) {
      return 'delayed';
    } else {
      return 'borrowing';
    }
  }

  const renderStatusBadge = (return_date: string, returned: number) => {
    type IconType = 'processing' | 'error' | 'success';
    const info = getStatus(return_date, returned);
    const status = statusMap[info];
    if (!status) {
      return <span>未知</span>;
    }

    const icon: IconType = status.icon as IconType;
    return <Badge status={icon} text={status.title} />
  }

  const { location } = history;

  const getBorrowingRecordDetail = (uuid: string) => {
    if (!uuid) {
      return;
    }

    setLoading(true);
    request.get(`/api/record/${uuid}`).then(res => {
      const detail = res.data.data || {};
      setDetail(detail);
      setTotal(total);
    }).finally(() => setLoading(false));
  }

  const fetchRecordDetail = () => {
    const { query = {} } = location;
    const { uuid = '' } = query;

    getBorrowingRecordDetail(uuid);
  }

  useEffect(() => {
    fetchRecordDetail();
  }, [location.query]);

  const handleReturnBook = (uuid: string) => {
    if (!uuid) {
      return;
    }
    request.delete(`/api/record/${uuid}`).then(res => {
      if (res) {
        fetchRecordDetail();
      }
    });
  }

  const handleSubmitPayment = (values: any) => {
    console.log(values);
    setSubmitLoading(true);
    request.post('/api/punishment', { ...values, uuid: detail.uuid }).then(res => {
      if (res) {
        setPayVisible(false);
      }
    }).finally(() => {
      setSubmitLoading(false);
      fetchRecordDetail();
    });
  }

  const columns = [
    {
      title: '滞纳金订单号',
      dataIndex: 'uuid',
      width: 120,
      key: 'uuid',
    },
    {
      title: '缴纳金额（人民币）',
      dataIndex: 'amount',
      width: 100,
      key: 'amount',
    },
    {
      title: '缴纳日期',
      dataIndex: 'created_at',
      width: 200,
      key: 'return_date',
      render: (text: string, record: any) => new Date(Date.parse(record['created_at'])).toLocaleString(),
    },
  ];

  return (
    <PageContainer>
      <Card className="content borrowing-detail" loading={loading}>
        <div>
          <Button
            type="link"
            disabled={detail.amount - detail.paid <= 0}
            onClick={() => setPayVisible(true)}
          >
            缴纳滞纳金
          </Button>
          <Popconfirm
            title="确认归还吗"
            okText="确定"
            cancelText="取消"
            onConfirm={() => handleReturnBook(location?.query?.uuid || '')}
            disabled={detail.amount - detail.paid > 0 || detail.returned === 1}
          >
            <Button
              type="link"
              disabled={detail.amount - detail.paid > 0 || detail.returned === 1}
            >
              归还
            </Button>
          </Popconfirm>
        </div>
        <Divider />
        <Descriptions title="借阅单信息" bordered>
          <Descriptions.Item label="订单号">{detail.uuid}</Descriptions.Item>
          <Descriptions.Item label="借出时间">
            {new Date(detail.created_at).toLocaleString()}
          </Descriptions.Item>
          <Descriptions.Item label="归还日期">
            {new Date(detail.return_date).toLocaleDateString()}
          </Descriptions.Item>
          <Descriptions.Item label="状态" span={3}>
            {renderStatusBadge(detail.return_date, detail.returned)}
          </Descriptions.Item>
          <Descriptions.Item label="滞纳金总额（人民币）">{detail.returned === 1 ? 0 : detail.amount}</Descriptions.Item>
          <Descriptions.Item label="已缴金额（人民币）">{detail.returned === 1 ? 0 : detail.paid}</Descriptions.Item>
          <Descriptions.Item label="待缴金额（人民币）">{detail.returned === 1 ? 0 : ((detail.amount || 0) - (detail.paid || 0))}</Descriptions.Item>
        </Descriptions>

        <Descriptions title="借阅人信息" bordered>
          <Descriptions.Item label="姓名">{detail?.reader?.name}</Descriptions.Item>
          <Descriptions.Item label="性别">
            {detail?.reader?.gender ? (detail?.reader?.gender === 0 ? '男' : '女') : ''}
          </Descriptions.Item>
          <Descriptions.Item label="登记时间">
            {new Date(detail.created_at).toLocaleString()}
          </Descriptions.Item>
          <Descriptions.Item label="身份证号" span={2}>{detail?.reader?.id_card || ''}</Descriptions.Item>
          <Descriptions.Item label="电话号码">{detail?.reader?.phone || ''}</Descriptions.Item>
        </Descriptions>

        <Descriptions title="图书信息" bordered>
          <Descriptions.Item label="名称">{detail?.book?.name || ''}</Descriptions.Item>
          <Descriptions.Item label="ISBN">{detail?.book?.isbn || ''}</Descriptions.Item>
          <Descriptions.Item label="作者">{detail?.book?.author || ''}</Descriptions.Item>
          <Descriptions.Item label="出版社" span={2}>{detail?.book?.publisher}</Descriptions.Item>
          <Descriptions.Item label="发行日期">
            {
              detail?.book?.publish_date
              ? new Date(detail.book.publish_date).toLocaleDateString()
              : ''
            }
          </Descriptions.Item>
          <Descriptions.Item label="入库时间">
            {new Date(detail?.book?.created_at).toLocaleString()}
          </Descriptions.Item>
          <Descriptions.Item label="剩余库存">
            {detail?.book?.count || ''}
          </Descriptions.Item>
        </Descriptions>

        <div>
          <div className="ant-descriptions-header">
            <div className="ant-descriptions-title">
              滞纳金缴纳记录
            </div>
          </div>
          <Table
            rowKey="uuid"
            columns={columns}
            scroll={{ x: 1000 }}
            dataSource={detail && detail.punishments || []}
            pagination={false}
            style={{ marginTop: 20 }}
          ></Table>
        </div>
      </Card>

      <Modal
        title="输入缴纳金额"
        visible={payVisible}
        okText="提交"
        cancelText="取消"
        onOk={() => form.submit()}
        onCancel={() => setPayVisible(false)}
        confirmLoading={submitLoading}
      >
        <Form form={form} onFinish={handleSubmitPayment}>
          <Form.Item name="amount">
            <InputNumber size="large" min={0} max={detail.amount - detail.paid} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
}
