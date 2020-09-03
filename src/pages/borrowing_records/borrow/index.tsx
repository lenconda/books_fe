import React, { useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Card, Form, Button, Select, DatePicker } from 'antd';
import { request } from '@/utils';
import { history } from 'umi';
import debounce from 'lodash/debounce';
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
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [searchReaderLoading, setSearchReaderLoading] = useState<boolean>(false);
  const [searchBookLoading, setSearchBookLoading] = useState<boolean>(false);
  const [readersSearchResult, setReadersSearchResult] = useState<Record<string, any>[]>([]);
  const [booksSearchResult, setBooksSearchResult] = useState<Record<string, any>[]>([]);

  const handleSubmitBorrow = (values: any) => {
    setSubmitLoading(true);
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
        <Form
          {...layout}
          form={form}
          name="basic"
          initialValues={{ remember: true }}
          onFinish={handleSubmitBorrow}
        >
          <Form.Item
            label="借阅人"
            name="reader"
            rules={[{ required: true, message: '请选择借阅人' }]}
          >
            <Select
              placeholder="键入以搜索..."
              showSearch={true}
              loading={searchReaderLoading}
              onSelect={() => setReadersSearchResult([])}
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
            name="reader"
            rules={[{ required: true, message: '请选择图书' }]}
          >
            <Select
              placeholder="键入以搜索..."
              showSearch={true}
              loading={searchBookLoading}
              onSelect={() => setBooksSearchResult([])}
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
