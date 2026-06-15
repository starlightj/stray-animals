const api = require('../../utils/api')

Page({
  data: {
    imageUrl: '',
    recognizing: false,
    result: { show: false },
    resultInfo: { species: '', color: '', features: '' },
    showForm: false,
    speciesList: ['猫', '狗', '其他'],
    form: {
      name: '',
      species: '',
      color: '',
      features: '',
      location: '校园内'
    },
    // AI 缓存
    aiType: null
  },

  onSpeciesChange(e) {
    this.setData({ 'form.species': this.data.speciesList[e.detail.value] })
  },

  chooseImage() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempPath = res.tempFilePaths[0]
        this.setData({ imageUrl: tempPath, result: { show: false }, showForm: false })
        this.uploadAndRecognize(tempPath)
      }
    })
  },

  async uploadAndRecognize(filePath) {
    this.setData({ recognizing: true })

    try {
      // 1. 上传图片
      const uploadResult = await api.uploadImage(filePath)

      // 2. 调用后端识别 API（微信小程序不支持前端 TensorFlow.js，由后端处理）
      let aiType = '不确定'
      let confidence = 0

      try {
        const recResult = await api.request('/recognition/image', {
          method: 'POST',
          data: { imageUrl: uploadResult.imageUrl }
        })
        aiType = recResult.species
        confidence = Math.round(parseFloat(recResult.confidence) * 100)
      } catch (e) {
        console.warn('识别API调用失败，使用默认值', e)
        confidence = 50
      }

      // 3. 更新 UI
      const aiClass = aiType === '猫' ? 'cat' : aiType === '狗' ? 'dog' : 'uncertain'
      const aiIcon = aiType === '猫' ? '🐱' : aiType === '狗' ? '🐶' : '❓'
      const aiLabel = aiType === '不确定' ? '不确定，请手动选择' : `识别为：${aiType}`
      const barClass = confidence >= 80 ? 'high' : confidence >= 60 ? 'medium' : 'low'

      // 随机生成颜色/特征
      const colors = ['黄色', '黑色', '白色', '棕色', '花斑', '橘色', '灰色']
      const features = ['性格温顺，喜欢亲近人', '体型中等，耳朵竖立', '毛发浓密', '经常在校园里活动', '尾巴蓬松']
      const color = colors[Math.floor(Math.random() * colors.length)]
      const feature = features[Math.floor(Math.random() * features.length)]

      const speciesVal = aiType === '不确定' ? '' : aiType

      this.setData({
        recognizing: false,
        aiType: speciesVal || null,
        result: {
          show: true,
          aiClass, aiIcon, aiLabel,
          confidence,
          barClass,
          aiTypeText: aiType === '不确定' ? '⚠️ 无法确定' : (aiType === '猫' ? '🐱 ' : '🐶 ') + aiType
        },
        resultInfo: { species: speciesVal || '请选择', color, features: feature },
        showForm: true,
        'form.species': speciesVal,
        'form.color': color,
        'form.features': feature,
        'form.location': '校园内',
        uploadedImageUrl: uploadResult.imageUrl
      })
    } catch (e) {
      console.error('识别失败', e)
      this.setData({
        recognizing: false,
        result: { show: true, aiClass: 'uncertain', aiIcon: '❌', aiLabel: '识别失败，请手动填写', confidence: 0, barClass: 'low', aiTypeText: '❌ 识别失败' },
        showForm: true
      })
    }
  },

  async saveAnimal() {
    const form = this.data.form
    if (!form.species) {
      wx.showToast({ title: '请选择物种', icon: 'none' })
      return
    }

    try {
      await api.createAnimal({
        name: form.name || '未命名',
        species: form.species,
        color: form.color,
        features: form.features,
        imageUrl: this.data.uploadedImageUrl || this.data.imageUrl,
        animal_type: this.data.aiType,
        location: {
          latitude: 39.9042 + Math.random() * 0.01,
          longitude: 116.4074 + Math.random() * 0.01,
          address: form.location || '校园内'
        }
      })
      wx.showToast({ title: '保存成功！' })
      this.resetForm()
    } catch (e) {
      console.error('保存失败', e)
    }
  },

  resetForm() {
    this.setData({
      imageUrl: '', recognizing: false,
      result: { show: false }, showForm: false,
      form: { name: '', species: '', color: '', features: '', location: '校园内' },
      aiType: null, uploadedImageUrl: null
    })
  }
})
