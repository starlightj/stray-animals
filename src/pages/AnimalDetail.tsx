import React, { useEffect, useState } from 'react';
import { Card, Spin, Button, message, Descriptions, Image } from 'antd';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getAnimalById } from '@/api/animal';
import type { AnimalRecord } from '@/types/animal';

const AnimalDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [animal, setAnimal] = useState<AnimalRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadAnimalDetail();
    }
  }, [id]);

  const loadAnimalDetail = async () => {
    try {
      setLoading(true);
      const data = await getAnimalById(id!);
      setAnimal(data);
    } catch (error) {
      message.error('加载动物详情失败');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!animal) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <p>动物信息不存在</p>
        <Button type="primary" onClick={() => navigate('/archive')}>
          返回档案列表
        </Button>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ marginBottom: 24 }}>动物详情</h1>
      <Card>
        <div style={{ display: 'flex', gap: 24, marginBottom: 24 }}>
          <Image
            width={300}
            src={animal.imageUrl}
            alt={animal.name || '动物图片'}
          />
          <div style={{ flex: 1 }}>
            <Descriptions column={2}>
              <Descriptions.Item label="名称">{animal.name || '未命名'}</Descriptions.Item>
              <Descriptions.Item label="物种">{animal.species}</Descriptions.Item>
              <Descriptions.Item label="毛色">{animal.color}</Descriptions.Item>
              <Descriptions.Item label="特征">{animal.features || '无'}</Descriptions.Item>
              <Descriptions.Item label="发现时间">
                {new Date(animal.createdAt).toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="更新时间">
                {new Date(animal.updatedAt).toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="位置" span={2}>
                {animal.location.address || `经度: ${animal.location.longitude}, 纬度: ${animal.location.latitude}`}
              </Descriptions.Item>
            </Descriptions>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end' }}>
          <Button>
            <Link to="/archive">返回列表</Link>
          </Button>
          <Button type="primary">编辑信息</Button>
        </div>
      </Card>
    </div>
  );
};

export default AnimalDetail;
