const api = require('../../utils/api')

Page({
  data: { animal: null, loading: true },

  onLoad(options) {
    if (options.id) this.loadAnimal(options.id)
  },

  async loadAnimal(id) {
    this.setData({ loading: true })
    try {
      const animal = await api.getAnimal(id)
      this.setData({ animal, loading: false })
    } catch (e) {
      this.setData({ loading: false })
    }
  },

  goEdit() {
    wx.navigateTo({ url: `/pages/edit/edit?id=${this.data.animal.id}` })
  },

  goAdopt() {
    wx.navigateTo({ url: `/pages/adopt/adopt` })
  },

  goComments() {
    const animal = this.data.animal
    wx.navigateTo({ url: `/pages/comments/comments?id=${animal.id}&name=${encodeURIComponent(animal.name || '未命名')}` })
  },

  goBack() {
    wx.navigateBack()
  }
})
