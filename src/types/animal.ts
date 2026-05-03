// 动物档案记录
export interface AnimalRecord {
  id: string;
  name?: string;
  species: string;        // 猫、狗、其他
  color: string;          // 毛色
  features?: string;      // 特征描述
  imageUrl: string;       // 图片地址
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// 图像识别返回结果
export interface RecognizeResult {
  species: string;
  color: string;
  confidence: number;          // 0-1
  features?: string;
  similarAnimals?: AnimalRecord[];
}