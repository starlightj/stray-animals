import React, { useEffect } from 'react';
import { Card, Row, Col, Statistic, Spin, message } from 'antd';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getAnimals } from '@/api/animal';
import { useAnimalContext } from '@/context/AnimalContext';

const Dashboard: React.FC = () => {
  const { animals, setAnimals, loading, setLoading } = useAnimalContext();

  useEffect(() => {
    loadAnimals();
  }, []);

  const loadAnimals = async () => {
    try {
      setLoading(true);
      const response = await getAnimals({ page: 1, pageSize: 100 });
      setAnimals(response.data);
    } catch (error) {
      message.error('加载动物数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 统计数据
  const totalAnimals = animals.length;
  const speciesCount = animals.reduce((acc, animal) => {
    acc[animal.species] = (acc[animal.species] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // 准备图表数据
  const pieData = Object.entries(speciesCount).map(([name, value]) => ({
    name,
    value,
  }));

  const barData = Object.entries(speciesCount).map(([name, value]) => ({
    name,
    数量: value,
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ marginBottom: 24 }}>数据看板</h1>
      <Spin spinning={loading}>
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col span={8}>
            <Card>
              <Statistic title="总动物数量" value={totalAnimals} />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic title="物种数量" value={Object.keys(speciesCount).length} />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic title="今日新增" value={0} />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Card title="物种分布">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          <Col span={12}>
            <Card title="物种数量统计">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="数量" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
};

export default Dashboard;
