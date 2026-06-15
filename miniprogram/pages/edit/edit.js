const api = require('../../utils/api')

Page({
  data: {
    loading: true,
    animalId: null,
    form: {
      name: '', species: '', color: '', features: '',
      imageUrl: '', location: '', animal_type: null, aiTypeText: '无'
    }
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ animalId: options.id })
      this.loadAnimal(options.id)
    }
  },

  async loadAnimal(id) {
    try {
      const animal = await api.getAnimal(id)
      this.setData({
        loading: false,
        form: {
          name: animal.name || '',
          species: animal.species || '',
          color: animal.color || '',
          features: animal.features || '',
          imageUrl: animal.imageUrl || '',
          location: animal.location?.address || '',
          animal_type: animal.animal_type || null,
          aiTypeText: animal.animal_type === '猫' ? '🐱 猫' : animal.animal_type === '狗' ? '🐶 狗' : '无'
        }
      })
    } catch (e) {
      this.setData({ loading: false })
    }
  },

  onSpecies(e) {
    const species = ['猫', '狗', '其他'][e.detail.value]
    this.setData({ 'form.species': species })
  },

  onAiType(e) {
    const types = [null, '猫', '狗']
    const idx = e.detail.value
    this.setData({
      'form.animal_type': types[idx],
      'form.aiTypeText': idx === 0 ? '无' : idx === 1 ? '🐱 猫' : '🐶 狗'
    })
  },

  uploadImage() {
    wx.chooseImage({
      count: 1,
      success: async (res) => {
        try {
          const result = await api.uploadImage(res.tempFilePaths[0])
          this.setData({ 'form.imageUrl': result.imageUrl })
          wx.showToast({ title: '上传成功' })
        } catch (e) {
          wx.showToast({ title: '上传失败', icon: 'none' })
        }
      }
    })
  },

  async save() {
    const f = this.data.form
    if (!f.species) {
      wx.showToast({ title: '请选择物种', icon: 'none' }); return
    }

    try {
      await api.updateAnimal(this.data.animalId, {
        name: f.name || '未命名',
        species: f.species,
        color: f.color,
        features: f.features,
        imageUrl: f.imageUrl,
        animal_type: f.animal_type,
        location: {
          latitude: 39.9042 + Math.random() * 0.01,
          longitude: 116.4074 + Math.random() * 0.01,
          address: f.location || '校园内'
        }
      })
      wx.showToast({ title: '保存成功！' })
      wx.navigateBack()
    } catch (e) {
      console.error('保存失败', e)
    }
  },

  goBack() {
    wx.navigateBack()
  }
})
