import React, { useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Card, Form, Button, Select, DatePicker, Divider, Typography, Alert } from 'antd';
import { request } from '@/utils';
import { history, Link } from 'umi';
import debounce from 'lodash/debounce';

const { Text } = Typography;

const layout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 24 },
    md: { span: 4 },
    lg: { span: 3 },
    xl: { span: 2 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 24 },
    md: { span: 10 },
    lg: { span: 8 },
    xl: { span: 6 },
  },
};

const tailLayout = {
  wrapperCol: {
    xs: { offset: 0, span: 24 },
    sm: { offset: 0, span: 24 },
    md: { offset: 4, span: 20 },
    lg: { offset: 3, span: 21 },
    xl: { offset: 2, span: 22 },
  },
};

export default (): React.ReactNode => {
  const [form] = Form.useForm();
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [searchReaderLoading, setSearchReaderLoading] = useState<boolean>(false);
  const [searchBookLoading, setSearchBookLoading] = useState<boolean>(false);
  const [readersSearchResult, setReadersSearchResult] = useState<Record<string, any>[]>([]);
  const [booksSearchResult, setBooksSearchResult] = useState<Record<string, any>[]>([]);
  const [newBorrowingRecordInfo, setNewBorrowingRecordInfo] = useState<Record<string, any>>({});

  const handleSubmitBorrow = (values: any) => {
    setSubmitLoading(true);
    values.return_date = values.return_date.startOf('day').toISOString();
    request.post('/api/record', values).then(res => {
      if (res) {
        form.resetFields();
        setNewBorrowingRecordInfo(res.data.data || {});
      }
    }).finally(() => setSubmitLoading(false));
  };

  const handleSearch = debounce((keyword: string, type: 'reader' | 'book') => {
    switch(type) {
      case 'reader':
        setSearchReaderLoading(true);
        break;
      case 'book':
        setSearchBookLoading(true);
        break;
      default: break;
    }
    request.post(`/api/${type}/search`, { keyword }).then(res => {
      const items = res.data.data && res.data.data.items || [];
      switch(type) {
        case 'reader':
          setReadersSearchResult(items);
          break;
        case 'book':
          setBooksSearchResult(items);
          break;
        default: break;
      }
    }).finally(() => {
      setSearchReaderLoading(false);
      setSearchBookLoading(false);
    });
  }, 500);

  return (
    <PageContainer>
      <Card>
        <div>
          <Button type="link" onClick={() => history.push('/borrowing_records')}>借阅列表</Button>
          <Button type="link" onClick={() => history.push('/books')}>图书列表</Button>
        </div>
        <Divider />
        {
          !!(newBorrowingRecordInfo && newBorrowingRecordInfo.uuid) && (
            <Alert
              type="success"
              message="成功借出"
              closable={true}
              showIcon={true}
              onClose={() => setNewBorrowingRecordInfo({})}
              style={{ marginBottom: 20 }}
              description={
                <p>
                  你提交的借阅单：
                  {newBorrowingRecordInfo.reader.name}({newBorrowingRecordInfo.reader.id_card})
                  &nbsp;-&nbsp;
                  {newBorrowingRecordInfo.book.name}({newBorrowingRecordInfo.book.isbn}) 已成功借出，
                  <Link to={`/borrowing_records/detail?uuid=${newBorrowingRecordInfo.uuid}`}>单击此处</Link>以查看借阅单详细信息。
                </p>
              }
            />
          )
        }
        <Form
          {...layout}
          form={form}
          name="basic"
          initialValues={{ remember: true }}
          onFinish={handleSubmitBorrow}
        >
          <Form.Item
            label="借阅人"
            name="id_card"
            rules={[{ required: true, message: '请选择借阅人' }]}
            help={
              <Text type="secondary">
                若无法搜索到目标，则有可能是借阅人信息未录入。<Link to="/readers/info">立刻录入</Link>
              </Text>
            }
          >
            <Select
              placeholder="键入以搜索..."
              showSearch={true}
              loading={searchReaderLoading}
              defaultActiveFirstOption={false}
              filterOption={false}
              onSearch={(keyword: string) => handleSearch(keyword, 'reader')}
            >
              {
                readersSearchResult.map(item =>
                  <Select.Option
                    key={item.id_card}
                    value={item.id_card}
                  >
                    {item.name}, {item.id_card}
                  </Select.Option>
                )
              }
            </Select>
          </Form.Item>
          <Form.Item
            label="图书"
            name="isbn"
            rules={[{ required: true, message: '请选择图书' }]}
            help={
              <Text type="secondary">
                若无法搜索到目标，则有可能是图书信息未录入。<Link to="/books/settlein">立刻录入</Link>
              </Text>
            }
          >
            <Select
              placeholder="键入以搜索..."
              showSearch={true}
              loading={searchBookLoading}
              defaultActiveFirstOption={false}
              filterOption={false}
              onSearch={(keyword: string) => handleSearch(keyword, 'book')}
            >
              {
                booksSearchResult.map(item =>
                  <Select.Option
                    key={item.isbn}
                    value={item.isbn}
                  >
                    {item.name}, {item.isbn}, {item.author}{item.publisher && `, ${item.publisher}`}
                  </Select.Option>
                )
              }
            </Select>
          </Form.Item>
          <Form.Item
            label="归还日期"
            name="return_date"
            rules={[{ required: true, message: '请选择归还日期' }]}
          >
            <DatePicker
              placeholder="打开日历并选择日期"
              style={{ width: '100%' }}
              disabledDate={currentDate => Date.now() > currentDate.startOf('day').valueOf()}
            />
          </Form.Item>
          <Form.Item {...tailLayout}>
            <Button htmlType="submit" type="primary" loading={submitLoading}>确定</Button>
            <Button style={{ marginLeft: 10 }} onClick={() => history.goBack()}>取消</Button>
          </Form.Item>
        </Form>
      </Card>
    </PageContainer>
  );
}
