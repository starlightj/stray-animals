const express = require('express');
const router = express.Router();
const multer = require('multer');

// 配置文件上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// 确保uploads目录存在
const fs = require('fs');
if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads');
}

// 图像识别API
router.post('/image', upload.single('image'), (req, res) => {
  try {
    // 模拟图像识别结果
    const mockResults = [
      { species: '猫', color: '橘色', confidence: 0.95, features: '体型中等，耳朵竖立' },
      { species: '狗', color: '黄色', confidence: 0.88, features: '体型较大，四肢粗壮' },
      { species: '猫', color: '白色', confidence: 0.92, features: '蓝眼睛，长毛' },
      { species: '狗', color: '黑色', confidence: 0.90, features: '短毛，尾巴卷曲' },
      { species: '猫', color: '花斑', confidence: 0.85, features: '尾巴有白色斑块' }
    ];

    // 随机选择一个结果
    const result = mockResults[Math.floor(Math.random() * mockResults.length)];

    // 返回识别结果
    res.json({
      success: true,
      data: {
        species: result.species,
        color: result.color,
        confidence: result.confidence,
        features: result.features
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;