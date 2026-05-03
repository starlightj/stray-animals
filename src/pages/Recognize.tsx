import React, { useState } from 'react';
import { Upload, Button, Card, Form, Input, Select, Spin, message, Modal } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { recognizeAnimal, saveAnimal } from '@/api/animal';
import { useAnimalContext } from '@/context/AnimalContext';

const { Option } = Select;

const Recognize: React.FC = () => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<any[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
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
            // 使用默认位置作为备用方案
            resolve({
              latitude: 39.9042,
              longitude: 116.4074,
            });
          }
        );
      } else {
        console.warn('浏览器不支持地理位置，使用默认位置');
        // 使用默认位置作为备用方案
        resolve({
          latitude: 39.9042,
          longitude: 116.4074,
        });
      }
    });
  };

  const handleUpload = async (file: any) => {
    try {
      setLoading(true);
      const location = await getGeolocation();
      const result = await recognizeAnimal(file, location.latitude, location.longitude);
      setRecognizeResult(result);
      form.setFieldsValue({
        species: result.species,
        color: result.color,
        features: result.features,
      });
      message.success('识别成功');
    } catch (error) {
      message.error('识别失败，请重试');
    } finally {
      setLoading(false);
    }
    return false; // 阻止自动上传
  };

  const handlePreview = (file: any) => {
    setPreviewImage(file.url || file.thumbUrl);
    setPreviewOpen(true);
  };

  const handleSave = async (values: any) => {
    try {
      setLoading(true);
      const location = await getGeolocation();
      await saveAnimal({
        ...values,
        imageUrl: fileList[0].response?.data?.imageUrl || fileList[0].url,
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
        },
      });
      message.success('保存成功');
      form.resetFields();
      setFileList([]);
      setRecognizeResult(null);
    } catch (error) {
      message.error('保存失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const uploadProps = {
    fileList,
    beforeUpload: handleUpload,
    onPreview: handlePreview,
    onChange: (info: any) => {
      setFileList(info.fileList);
    },
    maxCount: 1,
  };

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ marginBottom: 24 }}>识别上报</h1>
      <Card>
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item label="上传图片" required>
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />}>点击上传</Button>
            </Upload>
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

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              保存
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Modal
        open={previewOpen}
        title="预览"
        footer={null}
        onCancel={() => setPreviewOpen(false)}
      >
        <img alt="预览" style={{ width: '100%' }} src={previewImage} />
      </Modal>
    </div>
  );
};

export default Recognize;
