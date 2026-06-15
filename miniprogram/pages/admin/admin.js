const api = require('../../utils/api')

Page({
  data: {
    list: [],
    allAnimals: [],
    keyword: '',
    currentFilter: '',
    speciesFilter: ['全部', '猫', '狗', '其他'],
    loading: true,
    showAddModal: false,
    addForm: { name: '', species: '', color: '', features: '', imageUrl: '', location: '校园内' }
  },

  onLoad() { this.loadData() },
  onShow() { this.loadData() },
  onPullDownRefresh() { this.loadData().then(() => wx.stopPullDownRefresh()) },

  async loadData() {
    this.setData({ loading: true })
    try {
      const animals = await api.getAnimals()
      this.setData({ allAnimals: animals, loading: false })
      this.filterData()
    } catch (e) { this.setData({ loading: false }) }
  },

  onSearch() { this.filterData() },
  onFilter(e) {
    const idx = e.detail.value
    this.setData({ currentFilter: idx === 0 ? '' : this.data.speciesFilter[idx] })
    this.filterData()
  },

  filterData() {
    let list = [...this.data.allAnimals]
    const kw = this.data.keyword.toLowerCase()
    const f = this.data.currentFilter
    if (f) list = list.filter(a => a.species === f)
    if (kw) list = list.filter(a => (a.name||'').includes(kw) || (a.features||'').includes(kw))
    this.setData({ list })
  },

  // 添加
  showAdd() {
    this.setData({
      showAddModal: true,
      addForm: { name: '', species: '', color: '', features: '', imageUrl: '', location: '校园内' }
    })
  },
  hideAdd() { this.setData({ showAddModal: false }) },
  onAddSpecies(e) {
    const species = ['猫', '狗', '其他'][e.detail.value]
    this.setData({ 'addForm.species': species })
  },

  async submitAdd() {
    const f = this.data.addForm
    if (!f.species || !f.color || !f.imageUrl) {
      wx.showToast({ title: '请填写必填项', icon: 'none' }); return
    }
    try {
      await api.createAnimal({
        name: f.name || '未命名', species: f.species, color: f.color,
        features: f.features, imageUrl: f.imageUrl, animal_type: null,
        location: { latitude: 39.9042 + Math.random()*0.01, longitude: 116.4074 + Math.random()*0.01, address: f.location || '校园内' }
      })
      wx.showToast({ title: '添加成功' })
      this.hideAdd()
      this.loadData()
    } catch (e) { console.error(e) }
  },

  // 编辑
  editItem(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/edit/edit?id=${id}` })
  },

  // 删除
  deleteItem(e) {
    const { id, name } = e.currentTarget.dataset
    wx.showModal({
      title: '确认删除',
      content: `确定要删除「${name || '未命名'}」吗？`,
      success: async (res) => {
        if (res.confirm) {
          try {
            await api.deleteAnimal(id)
            wx.showToast({ title: '删除成功' })
            this.loadData()
          } catch (e) { console.error(e) }
        }
      }
    })
  }
})
