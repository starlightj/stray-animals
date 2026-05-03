import React, { useState, useEffect } from 'react';
import { Card, Tabs, Form, Input, Button, Table, message, Spin } from 'antd';
import { getAnimals, saveAnimal } from '@/api/animal';
import { useAnimalContext } from '@/context/AnimalContext';
import type { AnimalRecord } from '@/types/animal';

const Admin: React.FC = () => {
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('animals');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const { animals, setAnimals, loading, setLoading } = useAnimalContext();

  useEffect(() => {
    loadAnimals();
  }, [currentPage, pageSize]);

  const loadAnimals = async () => {
    try {
      setLoading(true);
      const response = await getAnimals({
        page: currentPage,
        pageSize,
      });
      setAnimals(response.data);
      setTotal(response.total);
    } catch (error) {
      message.error('加载动物数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (values: any) => {
    try {
      setLoading(true);
      await saveAnimal(values);
      message.success('保存成功');
      form.resetFields();
      loadAnimals();
    } catch (error) {
      message.error('保存失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => name || '未命名',
    },
    {
      title: '物种',
      dataIndex: 'species',
      key: 'species',
    },
    {
      title: '毛色',
      dataIndex: 'color',
      key: 'color',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (createdAt: string) => new Date(createdAt).toLocaleString(),
    },
  ];

  const tabItems = [
    {
      key: 'animals',
      label: '动物管理',
      children: (
        <>
          <div style={{ marginBottom: 24 }}>
            <Button type="primary" onClick={() => {
              form.resetFields();
              setActiveTab('add');
            }}>
              添加动物
            </Button>
          </div>
          <Spin spinning={loading}>
            <Table
              columns={columns}
              dataSource={animals}
              rowKey="id"
              pagination={{
                current: currentPage,
                pageSize,
                total,
                onChange: (page, size) => {
                  setCurrentPage(page);
                  setPageSize(size);
                },
              }}
              onRow={(record) => ({
                onClick: () => {
                  form.setFieldsValue(record);
                  setActiveTab('edit');
                },
              })}
            />
          </Spin>
        </>
      ),
    },
    {
      key: 'add',
      label: '添加动物',
      children: (
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="name" label="动物名称" rules={[{ required: false, message: '请输入动物名称' }]}>
            <Input placeholder="请输入动物名称（选填）" />
          </Form.Item>
          <Form.Item name="species" label="物种" rules={[{ required: true, message: '请输入物种' }]}>
            <Input placeholder="请输入物种" />
          </Form.Item>
          <Form.Item name="color" label="毛色" rules={[{ required: true, message: '请输入毛色' }]}>
            <Input placeholder="请输入毛色" />
          </Form.Item>
          <Form.Item name="features" label="特征描述" rules={[{ required: false, message: '请输入特征描述' }]}>
            <Input.TextArea rows={4} placeholder="请输入特征描述（选填）" />
          </Form.Item>
          <Form.Item name="imageUrl" label="图片URL" rules={[{ required: true, message: '请输入图片URL' }]}>
            <Input placeholder="请输入图片URL" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              保存
            </Button>
            <Button style={{ marginLeft: 8 }} onClick={() => setActiveTab('animals')}>
              取消
            </Button>
          </Form.Item>
        </Form>
      ),
    },
    {
      key: 'edit',
      label: '编辑动物',
      children: (
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="id" label="ID" hidden>
            <Input />
          </Form.Item>
          <Form.Item name="name" label="动物名称" rules={[{ required: false, message: '请输入动物名称' }]}>
            <Input placeholder="请输入动物名称（选填）" />
          </Form.Item>
          <Form.Item name="species" label="物种" rules={[{ required: true, message: '请输入物种' }]}>
            <Input placeholder="请输入物种" />
          </Form.Item>
          <Form.Item name="color" label="毛色" rules={[{ required: true, message: '请输入毛色' }]}>
            <Input placeholder="请输入毛色" />
          </Form.Item>
          <Form.Item name="features" label="特征描述" rules={[{ required: false, message: '请输入特征描述' }]}>
            <Input.TextArea rows={4} placeholder="请输入特征描述（选填）" />
          </Form.Item>
          <Form.Item name="imageUrl" label="图片URL" rules={[{ required: true, message: '请输入图片URL' }]}>
            <Input placeholder="请输入图片URL" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              保存
            </Button>
            <Button style={{ marginLeft: 8 }} onClick={() => setActiveTab('animals')}>
              取消
            </Button>
          </Form.Item>
        </Form>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ marginBottom: 24 }}>管理后台</h1>
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
      </Card>
    </div>
  );
};

export default Admin;
