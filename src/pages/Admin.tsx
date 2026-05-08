import React, { useState, useEffect } from 'react';
import { Card, Tabs, Form, Input, Button, Table, message, Spin, Upload, Image } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { getAnimals, saveAnimal, uploadImage } from '@/api/animal';
import { useAnimalContext } from '@/context/AnimalContext';
import type { AnimalRecord } from '@/types/animal';

const Admin: React.FC = () => {
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('animals');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const { animals, setAnimals, loading, setLoading } = useAnimalContext();

  const mockRecognizeAnimal = () => {
    const speciesList = ['猫', '狗', '其他'];
    const colorList = ['黄色', '黑色', '白色', '棕色', '花斑', '橘色', '灰色'];
    const featuresList = [
      '性格温顺，喜欢亲近人',
      '体型中等，耳朵竖立',
      '毛发浓密，看起来很健康',
      '经常在校园里活动',
      '尾巴蓬松，眼神灵动'
    ];

    const randomSpecies = speciesList[Math.floor(Math.random() * speciesList.length)];
    const randomColor = colorList[Math.floor(Math.random() * colorList.length)];
    const randomFeature = featuresList[Math.floor(Math.random() * featuresList.length)];

    form.setFieldValue('species', randomSpecies);
    form.setFieldValue('color', randomColor);
    form.setFieldValue('features', randomFeature);
    form.setFieldValue('location', {
      latitude: 39.9042 + Math.random() * 0.001,
      longitude: 116.4074 + Math.random() * 0.001,
      address: '校园内'
    });

    message.info('已自动填充动物信息（模拟识别）');
  };

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const result = await uploadImage(file);
      setPreviewImage(result.imageUrl);
      form.setFieldValue('imageUrl', result.imageUrl);
      mockRecognizeAnimal();
      message.success('图片上传成功，已自动填充动物信息');
    } catch (error) {
      message.error('图片上传失败');
    } finally {
      setUploading(false);
    }
  };

  const beforeUpload = (file: File) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('请上传图片文件');
      return false;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('图片大小不能超过2MB');
      return false;
    }
    handleImageUpload(file);
    return false;
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    if (key === 'animals') {
      setPreviewImage(null);
      form.resetFields();
    } else if (key === 'add') {
      setPreviewImage(null);
      form.resetFields();
    } else if (key === 'edit') {
      const values = form.getFieldsValue();
      setPreviewImage(values.imageUrl || null);
    }
  };

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
      setPreviewImage(null);
      setActiveTab('animals');
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
          <Form.Item name="imageUrl" label="图片上传" rules={[{ required: true, message: '请上传图片' }]}>
            <div>
              <input
                id="animal-image-upload"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleImageUpload(file);
                  }
                }}
                style={{ display: 'none' }}
              />
              <div
                style={{
                  border: '1px dashed #d9d9d9',
                  borderRadius: '4px',
                  padding: '32px',
                  textAlign: 'center',
                  backgroundColor: previewImage ? 'transparent' : '#fafafa',
                  minHeight: '120px'
                }}
              >
                {previewImage ? (
                  <div>
                    <Image
                      src={previewImage}
                      alt="preview"
                      style={{
                        maxWidth: '100%',
                        maxHeight: '200px',
                        objectFit: 'contain'
                      }}
                    />
                    <Button
                      type="default"
                      onClick={() => {
                        document.getElementById('animal-image-upload')?.click();
                      }}
                      style={{ marginTop: 16 }}
                    >
                      重新选择图片
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="primary"
                    onClick={() => {
                      document.getElementById('animal-image-upload')?.click();
                    }}
                    icon={<UploadOutlined />}
                    size="large"
                  >
                    点击选择图片
                  </Button>
                )}
              </div>
            </div>
          </Form.Item>
          <Form.Item name="location" label="位置信息">
            <div style={{ display: 'flex', gap: 16 }}>
              <Form.Item name={['location', 'latitude']} rules={[{ required: true, message: '请输入纬度' }]} style={{ flex: 1 }}>
                <Input placeholder="纬度" />
              </Form.Item>
              <Form.Item name={['location', 'longitude']} rules={[{ required: true, message: '请输入经度' }]} style={{ flex: 1 }}>
                <Input placeholder="经度" />
              </Form.Item>
            </div>
            <Form.Item name={['location', 'address']} rules={[{ required: true, message: '请输入地址' }]}>
              <Input placeholder="地址描述（如：图书馆前）" />
            </Form.Item>
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
          <Form.Item name="imageUrl" label="图片上传" rules={[{ required: true, message: '请上传图片' }]}>
            <div>
              <input
                id="animal-image-upload"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleImageUpload(file);
                  }
                }}
                style={{ display: 'none' }}
              />
              <div
                style={{
                  border: '1px dashed #d9d9d9',
                  borderRadius: '4px',
                  padding: '32px',
                  textAlign: 'center',
                  backgroundColor: previewImage ? 'transparent' : '#fafafa',
                  minHeight: '120px'
                }}
              >
                {previewImage ? (
                  <div>
                    <Image
                      src={previewImage}
                      alt="preview"
                      style={{
                        maxWidth: '100%',
                        maxHeight: '200px',
                        objectFit: 'contain'
                      }}
                    />
                    <Button
                      type="default"
                      onClick={() => {
                        document.getElementById('animal-image-upload')?.click();
                      }}
                      style={{ marginTop: 16 }}
                    >
                      重新选择图片
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="primary"
                    onClick={() => {
                      document.getElementById('animal-image-upload')?.click();
                    }}
                    icon={<UploadOutlined />}
                    size="large"
                  >
                    点击选择图片
                  </Button>
                )}
              </div>
            </div>
          </Form.Item>
          <Form.Item name="location" label="位置信息">
            <div style={{ display: 'flex', gap: 16 }}>
              <Form.Item name={['location', 'latitude']} rules={[{ required: true, message: '请输入纬度' }]} style={{ flex: 1 }}>
                <Input placeholder="纬度" />
              </Form.Item>
              <Form.Item name={['location', 'longitude']} rules={[{ required: true, message: '请输入经度' }]} style={{ flex: 1 }}>
                <Input placeholder="经度" />
              </Form.Item>
            </div>
            <Form.Item name={['location', 'address']} rules={[{ required: true, message: '请输入地址' }]}>
              <Input placeholder="地址描述（如：图书馆前）" />
            </Form.Item>
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
        <Tabs activeKey={activeTab} onChange={handleTabChange} items={tabItems} />
      </Card>
    </div>
  );
};

export default Admin;
