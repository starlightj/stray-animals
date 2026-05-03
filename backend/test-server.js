const http = require('http');
const fs = require('fs');

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  
  if (req.url === '/api/stats') {
    res.end(JSON.stringify({
      totalAnimals: 4,
      speciesCount: 2,
      todayAdd: 0,
      recognitions: 75
    }));
  } else if (req.url === '/api/animals') {
    res.end(JSON.stringify([
      {
        id: 1,
        name: '大黄',
        species: '狗',
        color: '黄色',
        features: '体型较大，性格温顺，喜欢在图书馆前晒太阳',
        imageUrl: 'https://picsum.photos/400/300?random=1',
        location: {
          latitude: 39.9042,
          longitude: 116.4074,
          address: '图书馆前'
        },
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        name: '小黑',
        species: '猫',
        color: '黑色',
        features: '经常在教学楼附近活动，喜欢翻找垃圾桶',
        imageUrl: 'https://picsum.photos/400/300?random=2',
        location: {
          latitude: 39.9043,
          longitude: 116.4075,
          address: '教学楼旁'
        },
        createdAt: new Date().toISOString()
      },
      {
        id: 3,
        name: '小花',
        species: '猫',
        color: '花斑',
        features: '尾巴有白色斑块，性格粘人',
        imageUrl: 'https://picsum.photos/400/300?random=3',
        location: {
          latitude: 39.9044,
          longitude: 116.4076,
          address: '食堂附近'
        },
        createdAt: new Date().toISOString()
      },
      {
        id: 4,
        name: '旺财',
        species: '狗',
        color: '棕色',
        features: '短毛，耳朵下垂',
        imageUrl: 'https://picsum.photos/400/300?random=4',
        location: {
          latitude: 39.9045,
          longitude: 116.4077,
          address: '操场'
        },
        createdAt: new Date().toISOString()
      }
    ]));
  } else if (req.url.startsWith('/api/animals/')) {
    const id = req.url.split('/')[3];
    res.end(JSON.stringify({
      id: parseInt(id),
      name: '测试动物',
      species: '猫',
      color: '白色',
      features: '测试特征',
      imageUrl: 'https://picsum.photos/400/300?random=' + id,
      location: {
        latitude: 39.9042,
        longitude: 116.4074,
        address: '测试地点'
      },
      createdAt: new Date().toISOString()
    }));
  } else if (req.url === '/api/stats/latest') {
    res.end(JSON.stringify([
      {
        id: 1,
        name: '大黄',
        species: '狗',
        color: '黄色',
        imageUrl: 'https://picsum.photos/400/300?random=1',
        location: {
          address: '图书馆前'
        }
      },
      {
        id: 2,
        name: '小黑',
        species: '猫',
        color: '黑色',
        imageUrl: 'https://picsum.photos/400/300?random=2',
        location: {
          address: '教学楼旁'
        }
      }
    ]));
  } else if (req.url === '/api/map') {
    res.end(JSON.stringify([
      {
        id: 1,
        name: '大黄',
        species: '狗',
        imageUrl: 'https://picsum.photos/400/300?random=1',
        location: {
          address: '图书馆前'
        }
      },
      {
        id: 2,
        name: '小黑',
        species: '猫',
        imageUrl: 'https://picsum.photos/400/300?random=2',
        location: {
          address: '教学楼旁'
        }
      }
    ]));
  } else if (req.url === '/api/recognition/image') {
    res.end(JSON.stringify({
      success: true,
      data: {
        species: '猫',
        color: '橘色',
        confidence: 0.95,
        features: '体型中等，耳朵竖立'
      }
    }));
  } else {
    res.end(JSON.stringify({ message: 'API Test Server' }));
  }
});

const PORT = 8080;
server.listen(PORT, () => {
  console.log(`测试服务器运行在 http://localhost:${PORT}`);
});