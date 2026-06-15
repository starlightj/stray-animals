const api = require('../../utils/api')

Page({
  data: {
    list: [],
    allAnimals: [],
    keyword: '',
    currentFilter: '',
    speciesFilter: ['全部物种', '猫', '狗', '其他'],
    loading: true
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
    this.setData({ loading: true })
    try {
      const animals = await api.getAnimals()
      this.setData({ allAnimals: animals, loading: false })
      this.filterData()
    } catch (e) {
      this.setData({ loading: false })
    }
  },

  onSearch() {
    this.filterData()
  },

  onFilter(e) {
    const idx = e.detail.value
    const filter = this.data.speciesFilter[idx]
    this.setData({ currentFilter: filter === '全部物种' ? '' : filter })
    this.filterData()
  },

  filterData() {
    let list = [...this.data.allAnimals]
    const keyword = this.data.keyword.toLowerCase()
    const filter = this.data.currentFilter

    if (filter) {
      list = list.filter(a => a.species === filter)
    }
    if (keyword) {
      list = list.filter(a =>
        (a.name || '').toLowerCase().includes(keyword) ||
        (a.features || '').toLowerCase().includes(keyword)
      )
    }
    this.setData({ list })
  },

  goDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/detail/detail?id=${id}` })
  }
})
