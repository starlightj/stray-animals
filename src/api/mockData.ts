import type { AnimalRecord, RecognizeResult } from '@/types/animal';

// 模拟动物数据
export const mockAnimals: AnimalRecord[] = [
  {
    id: '1',
    name: '大黄',
    species: '狗',
    color: '黄色',
    features: '体型较大，性格温顺',
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=yellow%20dog%20on%20campus&image_size=square',
    location: {
      latitude: 39.9042,
      longitude: 116.4074,
      address: '图书馆前'
    },
    createdAt: '2026-04-20T10:00:00Z',
    updatedAt: '2026-04-20T10:00:00Z'
  },
  {
    id: '2',
    name: '小黑',
    species: '猫',
    color: '黑色',
    features: '经常在教学楼附近活动',
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=black%20cat%20on%20campus&image_size=square',
    location: {
      latitude: 39.9043,
      longitude: 116.4075,
      address: '教学楼旁'
    },
    createdAt: '2026-04-19T14:30:00Z',
    updatedAt: '2026-04-19T14:30:00Z'
  },
  {
    id: '3',
    name: '小花',
    species: '猫',
    color: '花斑',
    features: '尾巴有白色斑块',
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=calico%20cat%20on%20campus&image_size=square',
    location: {
      latitude: 39.9044,
      longitude: 116.4076,
      address: '食堂附近'
    },
    createdAt: '2026-04-18T09:15:00Z',
    updatedAt: '2026-04-18T09:15:00Z'
  }
];

// 模拟图像识别结果
export const mockRecognizeResult: RecognizeResult = {
  species: '猫',
  color: '橘色',
  confidence: 0.95,
  features: '体型中等，耳朵竖立',
  similarAnimals: [mockAnimals[2]]
};
