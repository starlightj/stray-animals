import apiClient from './client';
import type { AnimalRecord, RecognizeResult } from '@/types/animal';
import { mockAnimals, mockRecognizeResult } from './mockData';

// 使用模拟数据标志
const USE_MOCK_DATA = false;

// 上传图片
export const uploadImage = async (file: File) => {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 500));
    const reader = new FileReader();
    return new Promise<{ imageUrl: string }>((resolve) => {
      reader.onloadend = () => {
        resolve({ imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    });
  }
  
  const formData = new FormData();
  formData.append('image', file);
  const { data } = await apiClient.post<{ imageUrl: string }>('/api/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

// 上传图片并识别
export const recognizeAnimal = async (file: File, latitude: number, longitude: number) => {
  if (USE_MOCK_DATA) {
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    return mockRecognizeResult;
  }
  
  const formData = new FormData();
  formData.append('image', file);
  formData.append('latitude', String(latitude));
  formData.append('longitude', String(longitude));
  const { data } = await apiClient.post<RecognizeResult>('/api/recognize', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

// 获取动物列表（分页 + 筛选）
export const getAnimals = async (params: {
  page: number;
  pageSize: number;
  species?: string;
  keyword?: string;
}) => {
  if (USE_MOCK_DATA) {
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 应用筛选
    let filteredAnimals = [...mockAnimals];
    if (params.species) {
      filteredAnimals = filteredAnimals.filter(animal => animal.species === params.species);
    }
    if (params.keyword) {
      const keyword = params.keyword.toLowerCase();
      filteredAnimals = filteredAnimals.filter(animal => 
        (animal.name?.toLowerCase().includes(keyword) || false) ||
        (animal.features?.toLowerCase().includes(keyword) || false)
      );
    }
    
    // 应用分页
    const startIndex = (params.page - 1) * params.pageSize;
    const endIndex = startIndex + params.pageSize;
    const paginatedAnimals = filteredAnimals.slice(startIndex, endIndex);
    
    return {
      data: paginatedAnimals,
      total: filteredAnimals.length
    };
  }
  
  const { data } = await apiClient.get<{ data: AnimalRecord[]; total: number }>(
    '/api/animals',
    { params }
  );
  return data;
};

// 获取单个动物详情
export const getAnimalById = async (id: string) => {
  if (USE_MOCK_DATA) {
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 500));
    const animal = mockAnimals.find(a => a.id === id);
    if (!animal) {
      throw new Error('Animal not found');
    }
    return animal;
  }
  
  const { data } = await apiClient.get<AnimalRecord>(`/api/animals/${id}`);
  return data;
};

// 保存动物（新增 or 更新）
export const saveAnimal = async (animal: Partial<AnimalRecord>) => {
  if (USE_MOCK_DATA) {
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 800));
    console.log('保存动物数据:', animal);
    return { success: true };
  }
  
  if (animal.id) {
    // 更新
    return apiClient.put(`/api/animals/${animal.id}`, animal);
  } else {
    // 新增
    return apiClient.post('/api/animals', animal);
  }
};