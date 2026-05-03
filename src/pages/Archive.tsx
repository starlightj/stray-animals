import React, { useEffect, useState } from 'react';
import { Card, Table, Input, Select, Button, Spin, message } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { getAnimals } from '@/api/animal';
import { useAnimalContext } from '@/context/AnimalContext';
import type { AnimalRecord } from '@/types/animal';

const { Option } = Select;

const Archive: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [species, setSpecies] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const { animals, setAnimals, loading, setLoading } = useAnimalContext();

  useEffect(() => {
    loadAnimals();
  }, [currentPage, pageSize, searchText, species]);

  const loadAnimals = async () => {
    try {
      setLoading(true);
      const response = await getAnimals({
        page: currentPage,
        pageSize,
        keyword: searchText,
        species: species || undefined,
      });
      setAnimals(response.data);
      setTotal(response.total);
    } catch (error) {
      message.error('加载动物档案失败');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: '动物图片',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      render: (imageUrl: string) => (
        <img src={imageUrl} alt="动物" style={{ width: 80, height: 80, objectFit: 'cover' }} />
      ),
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
      title: '特征',
      dataIndex: 'features',
      key: 'features',
      render: (features: string) => features || '无',
    },
    {
      title: '发现时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (createdAt: string) => new Date(createdAt).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: AnimalRecord) => (
        <Link to={`/archive/${record.id}`}>
          <Button type="link">查看详情</Button>
        </Link>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ marginBottom: 24 }}>动物档案</h1>
      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
          <Input
            placeholder="搜索名称或特征"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
          <Select
            placeholder="筛选物种"
            value={species}
            onChange={setSpecies}
            style={{ width: 150 }}
          >
            <Option value="">全部</Option>
            <Option value="猫">猫</Option>
            <Option value="狗">狗</Option>
            <Option value="其他">其他</Option>
          </Select>
          <Button type="primary" onClick={loadAnimals}>
            搜索
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
          />
        </Spin>
      </Card>
    </div>
  );
};

export default Archive;
