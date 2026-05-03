# 校园流浪动物管理系统后端API文档

## 1. 基础信息

- **API基础路径**: `http://localhost:3000/api`
- **请求方法**: GET, POST, PUT, DELETE
- **响应格式**: JSON

## 2. 动物管理API

### 2.1 获取所有动物

- **端点**: `/animals`
- **方法**: GET
- **响应示例**:
  ```json
  [
    {
      "_id": "60c72b2f9f1b2c001c8e4b0a",
      "name": "大黄",
      "species": "狗",
      "color": "黄色",
      "features": "体型较大，性格温顺，喜欢在图书馆前晒太阳",
      "imageUrl": "https://picsum.photos/400/300?random=1",
      "location": {
        "latitude": 39.9042,
        "longitude": 116.4074,
        "address": "图书馆前"
      },
      "createdAt": "2026-04-20T10:00:00Z"
    },
    ...
  ]
  ```

### 2.2 获取单个动物

- **端点**: `/animals/:id`
- **方法**: GET
- **响应示例**:
  ```json
  {
    "_id": "60c72b2f9f1b2c001c8e4b0a",
    "name": "大黄",
    "species": "狗",
    "color": "黄色",
    "features": "体型较大，性格温顺，喜欢在图书馆前晒太阳",
    "imageUrl": "https://picsum.photos/400/300?random=1",
    "location": {
      "latitude": 39.9042,
      "longitude": 116.4074,
      "address": "图书馆前"
    },
    "createdAt": "2026-04-20T10:00:00Z"
  }
  ```

### 2.3 创建新动物

- **端点**: `/animals`
- **方法**: POST
- **请求体**:
  ```json
  {
    "name": "小花",
    "species": "猫",
    "color": "花斑",
    "features": "尾巴有白色斑块，性格粘人",
    "imageUrl": "https://picsum.photos/400/300?random=3",
    "location": {
      "latitude": 39.9044,
      "longitude": 116.4076,
      "address": "食堂附近"
    }
  }
  ```
- **响应示例**:
  ```json
  {
    "_id": "60c72b2f9f1b2c001c8e4b0b",
    "name": "小花",
    "species": "猫",
    "color": "花斑",
    "features": "尾巴有白色斑块，性格粘人",
    "imageUrl": "https://picsum.photos/400/300?random=3",
    "location": {
      "latitude": 39.9044,
      "longitude": 116.4076,
      "address": "食堂附近"
    },
    "createdAt": "2026-04-27T10:00:00Z"
  }
  ```

### 2.4 更新动物信息

- **端点**: `/animals/:id`
- **方法**: PUT
- **请求体**:
  ```json
  {
    "name": "大黄狗",
    "features": "体型较大，性格温顺，喜欢在图书馆前晒太阳，最近经常在操场活动"
  }
  ```
- **响应示例**:
  ```json
  {
    "_id": "60c72b2f9f1b2c001c8e4b0a",
    "name": "大黄狗",
    "species": "狗",
    "color": "黄色",
    "features": "体型较大，性格温顺，喜欢在图书馆前晒太阳，最近经常在操场活动",
    "imageUrl": "https://picsum.photos/400/300?random=1",
    "location": {
      "latitude": 39.9042,
      "longitude": 116.4074,
      "address": "图书馆前"
    },
    "createdAt": "2026-04-20T10:00:00Z"
  }
  ```

### 2.5 删除动物

- **端点**: `/animals/:id`
- **方法**: DELETE
- **响应示例**:
  ```json
  {
    "message": "动物已删除"
  }
  ```

### 2.6 按物种筛选

- **端点**: `/animals/filter/species?species=猫`
- **方法**: GET
- **响应示例**:
  ```json
  [
    {
      "_id": "60c72b2f9f1b2c001c8e4b0c",
      "name": "小黑",
      "species": "猫",
      "color": "黑色",
      "features": "经常在教学楼附近活动，喜欢翻找垃圾桶",
      "imageUrl": "https://picsum.photos/400/300?random=2",
      "location": {
        "latitude": 39.9043,
        "longitude": 116.4075,
        "address": "教学楼旁"
      },
      "createdAt": "2026-04-19T14:30:00Z"
    },
    ...
  ]
  ```

### 2.7 搜索动物

- **端点**: `/animals/search/query?query=黄色`
- **方法**: GET
- **响应示例**:
  ```json
  [
    {
      "_id": "60c72b2f9f1b2c001c8e4b0a",
      "name": "大黄",
      "species": "狗",
      "color": "黄色",
      "features": "体型较大，性格温顺，喜欢在图书馆前晒太阳",
      "imageUrl": "https://picsum.photos/400/300?random=1",
      "location": {
        "latitude": 39.9042,
        "longitude": 116.4074,
        "address": "图书馆前"
      },
      "createdAt": "2026-04-20T10:00:00Z"
    },
    ...
  ]
  ```

## 3. 图像识别API

### 3.1 上传图像并识别

- **端点**: `/recognition/image`
- **方法**: POST
- **请求体**: `multipart/form-data`
  - `image`: 图像文件
- **响应示例**:
  ```json
  {
    "success": true,
    "data": {
      "species": "猫",
      "color": "橘色",
      "confidence": 0.95,
      "features": "体型中等，耳朵竖立"
    }
  }
  ```

## 4. 统计数据API

### 4.1 获取统计数据

- **端点**: `/stats`
- **方法**: GET
- **响应示例**:
  ```json
  {
    "totalAnimals": 10,
    "speciesCount": 3,
    "todayAdd": 2,
    "recognitions": 75
  }
  ```

### 4.2 获取最新登记的动物

- **端点**: `/stats/latest`
- **方法**: GET
- **响应示例**:
  ```json
  [
    {
      "_id": "60c72b2f9f1b2c001c8e4b0a",
      "name": "大黄",
      "species": "狗",
      "color": "黄色",
      "features": "体型较大，性格温顺，喜欢在图书馆前晒太阳",
      "imageUrl": "https://picsum.photos/400/300?random=1",
      "location": {
        "latitude": 39.9042,
        "longitude": 116.4074,
        "address": "图书馆前"
      },
      "createdAt": "2026-04-20T10:00:00Z"
    },
    ...
  ]
  ```

## 5. 地图数据API

### 5.1 获取地图数据

- **端点**: `/map`
- **方法**: GET
- **响应示例**:
  ```json
  [
    {
      "id": "60c72b2f9f1b2c001c8e4b0a",
      "name": "大黄",
      "species": "狗",
      "color": "黄色",
      "imageUrl": "https://picsum.photos/400/300?random=1",
      "location": {
        "latitude": 39.9042,
        "longitude": 116.4074,
        "address": "图书馆前"
      }
    },
    ...
  ]
  ```

### 5.2 按物种筛选地图数据

- **端点**: `/map/filter?species=猫`
- **方法**: GET
- **响应示例**:
  ```json
  [
    {
      "id": "60c72b2f9f1b2c001c8e4b0c",
      "name": "小黑",
      "species": "猫",
      "color": "黑色",
      "imageUrl": "https://picsum.photos/400/300?random=2",
      "location": {
        "latitude": 39.9043,
        "longitude": 116.4075,
        "address": "教学楼旁"
      }
    },
    ...
  ]
  ```