const api = require('../../utils/api')

Page({
  data: {
    stats: { totalAnimals: 0, speciesCount: 0, recognitions: 0 },
    latest: []
  },

  onLoad() {
    this.loadData()
  },

  onPullDownRefresh() {
    this.loadData().then(() => wx.stopPullDownRefresh())
  },

  onShow() {
    this.loadData()
  },

  async loadData() {
    try {
      const [stats, latest] = await Promise.all([
        api.getStats(),
        api.getLatestAnimals()
      ])
      this.setData({ stats, latest })
    } catch (e) {
      console.error('加载失败', e)
    }
  },

  goDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/detail/detail?id=${id}` })
  },

  goRecognize() {
    wx.switchTab({ url: '/pages/recognize/recognize' })
  },

  goArchive() {
    wx.switchTab({ url: '/pages/archive/archive' })
  },

  goAdmin() {
    wx.switchTab({ url: '/pages/admin/admin' })
  },

  goAdopt() {
    wx.navigateTo({ url: '/pages/adopt/adopt' })
  }
})
