import React, { useEffect, useState, useRef } from 'react';
import { Card, Spin, message, Select } from 'antd';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getAnimals } from '@/api/animal';
import { useAnimalContext } from '@/context/AnimalContext';
import type { AnimalRecord } from '@/types/animal';

const { Option } = Select;

// 修复Leaflet图标问题
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const MapView: React.FC = () => {
  const [species, setSpecies] = useState('');
  const { animals, setAnimals, loading, setLoading } = useAnimalContext();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    loadAnimals();
  }, [species]);

  useEffect(() => {
    // 初始化地图
    if (mapRef.current && !mapInstance.current) {
      mapInstance.current = L.map(mapRef.current).setView([39.9042, 116.4074], 16);
      
      // 添加OpenStreetMap底图
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapInstance.current);
    }

    // 清除现有标记
    markersRef.current.forEach(marker => {
      if (mapInstance.current) {
        mapInstance.current.removeLayer(marker);
      }
    });
    markersRef.current = [];

    // 添加新标记
    animals.forEach(animal => {
      const marker = L.marker([animal.location.latitude, animal.location.longitude])
        .addTo(mapInstance.current!)
        .bindPopup(`
          <div style="min-width: 200px;">
            <h3 style="margin: 0 0 8px 0;">${animal.name || '未命名'}</h3>
            <p style="margin: 4px 0;"><strong>物种:</strong> ${animal.species}</p>
            <p style="margin: 4px 0;"><strong>毛色:</strong> ${animal.color}</p>
            <p style="margin: 4px 0;"><strong>位置:</strong> ${animal.location.address || '无地址'}</p>
            <img src="${animal.imageUrl}" alt="${animal.name}" style="width: 100%; height: 120px; object-fit: cover; margin-top: 8px; border-radius: 4px;" />
          </div>
        `);
      markersRef.current.push(marker);
    });

    // 清理函数
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [animals]);

  const loadAnimals = async () => {
    try {
      setLoading(true);
      const response = await getAnimals({
        page: 1,
        pageSize: 100,
        species: species || undefined,
      });
      setAnimals(response.data);
    } catch (error) {
      message.error('加载动物数据失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ marginBottom: 24 }}>地图追踪</h1>
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Select
            placeholder="筛选物种"
            value={species}
            onChange={setSpecies}
            style={{ width: 200 }}
          >
            <Option value="">全部</Option>
            <Option value="猫">猫</Option>
            <Option value="狗">狗</Option>
            <Option value="其他">其他</Option>
          </Select>
        </div>
        <Spin spinning={loading}>
          <div ref={mapRef} style={{ height: 600, width: '100%', borderRadius: 8 }} />
        </Spin>
      </Card>
    </div>
  );
};

export default MapView;
