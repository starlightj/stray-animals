const api = require('../../utils/api')

Page({
  data: {
    list: [],
    currentFilter: '',
    speciesFilter: ['全部物种', '猫', '狗', '其他'],
    loading: true
  },

  onLoad() { this.loadData() },
  onShow() { this.loadData() },
  onPullDownRefresh() { this.loadData().then(() => wx.stopPullDownRefresh()) },

  async loadData() {
    this.setData({ loading: true })
    try {
      const data = this.data.currentFilter
        ? await api.filterMapData(this.data.currentFilter)
        : await api.getMapData()
      this.setData({ list: data, loading: false })
    } catch (e) {
      this.setData({ loading: false })
    }
  },

  async onFilter(e) {
    const idx = e.detail.value
    const species = this.data.speciesFilter[idx]
    this.setData({ currentFilter: species === '全部物种' ? '' : species })
    this.loadData()
  },

  goDetail(e) {
    wx.navigateTo({ url: `/pages/detail/detail?id=${e.currentTarget.dataset.id}` })
  }
})
