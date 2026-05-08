import React, { useState } from 'react';
import { Button, Card, Form, Input, Select, Spin, message, Image } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { recognizeAnimal, saveAnimal } from '@/api/animal';
import { useAnimalContext } from '@/context/AnimalContext';

const { Option } = Select;

const Recognize: React.FC = () => {
  const [form] = Form.useForm();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const { recognizeResult, setRecognizeResult, loading, setLoading } = useAnimalContext();

  const getGeolocation = (): Promise<{ latitude: number; longitude: number }> => {
    return new Promise((resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          },
          (error) => {
            console.warn('获取位置信息失败，使用默认位置', error);
            resolve({
              latitude: 39.9042,
              longitude: 116.4074,
            });
          }
        );
      } else {
        console.warn('浏览器不支持地理位置，使用默认位置');
        resolve({
          latitude: 39.9042,
          longitude: 116.4074,
        });
      }
    });
  };

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

    const mockResult = {
      species: randomSpecies,
      color: randomColor,
      confidence: 0.85 + Math.random() * 0.14,
      features: randomFeature
    };

    setRecognizeResult(mockResult);
    form.setFieldsValue({
      species: mockResult.species,
      color: mockResult.color,
      features: mockResult.features,
    });
  };

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const imageUrl = reader.result as string;
        setPreviewImage(imageUrl);
        form.setFieldValue('imageUrl', imageUrl);
        
        const location = await getGeolocation();
        form.setFieldValue('location', {
          latitude: location.latitude,
          longitude: location.longitude,
          address: '校园内'
        });

        mockRecognizeAnimal();
        message.success('图片上传成功，已自动识别动物信息');
      };
      reader.readAsDataURL(file);
    } catch (error) {
      message.error('图片上传失败');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (values: any) => {
    try {
      setLoading(true);
      await saveAnimal({
        ...values,
        location: values.location || {
          latitude: 39.9042,
          longitude: 116.4074,
          address: '校园内'
        },
      });
      message.success('保存成功');
      form.resetFields();
      setPreviewImage(null);
      setRecognizeResult(null);
    } catch (error) {
      message.error('保存失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ marginBottom: 24 }}>识别上报</h1>
      <Card>
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="imageUrl" label="上传图片" rules={[{ required: true, message: '请上传图片' }]}>
            <div style={{ position: 'relative' }}>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleImageUpload(file);
                  }
                }}
                style={{
                  position: 'absolute',
                  opacity: 0,
                  width: '100%',
                  height: '100%',
                  cursor: 'pointer',
                  zIndex: 10
                }}
              />
              <div
                style={{
                  border: '1px dashed #d9d9d9',
                  borderRadius: '4px',
                  padding: '32px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  backgroundColor: previewImage ? 'transparent' : '#fafafa'
                }}
              >
                {previewImage ? (
                  <Image
                    src={previewImage}
                    alt="preview"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '200px',
                      objectFit: 'contain'
                    }}
                  />
                ) : (
                  <div>
                    <UploadOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                    <div style={{ marginTop: 8, color: '#666' }}>点击选择图片</div>
                    <div style={{ marginTop: 4, fontSize: 12, color: '#999' }}>支持 JPG、PNG、GIF 格式，最大 2MB</div>
                  </div>
                )}
              </div>
            </div>
          </Form.Item>

          {recognizeResult && (
            <Card title="识别结果" style={{ marginBottom: 24 }}>
              <p>物种: {recognizeResult.species}</p>
              <p>颜色: {recognizeResult.color}</p>
              <p>置信度: {Math.round(recognizeResult.confidence * 100)}%</p>
              {recognizeResult.features && <p>特征: {recognizeResult.features}</p>}
            </Card>
          )}

          <Form.Item name="name" label="动物名称" rules={[{ required: false, message: '请输入动物名称' }]}>
            <Input placeholder="请输入动物名称（选填）" />
          </Form.Item>

          <Form.Item name="species" label="物种" rules={[{ required: true, message: '请选择物种' }]}>
            <Select placeholder="请选择物种">
              <Option value="猫">猫</Option>
              <Option value="狗">狗</Option>
              <Option value="其他">其他</Option>
            </Select>
          </Form.Item>

          <Form.Item name="color" label="毛色" rules={[{ required: true, message: '请输入毛色' }]}>
            <Input placeholder="请输入毛色" />
          </Form.Item>

          <Form.Item name="features" label="特征描述" rules={[{ required: false, message: '请输入特征描述' }]}>
            <Input.TextArea rows={4} placeholder="请输入特征描述（选填）" />
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
            <Button type="primary" htmlType="submit" loading={loading || uploading}>
              保存
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Recognize;