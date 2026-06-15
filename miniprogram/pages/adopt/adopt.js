const api = require('../../utils/api')

Page({
  data: {
    animals: [],
    allAnimals: [],
    keyword: '',
    currentFilter: '',
    speciesFilter: ['全部物种', '猫', '狗', '其他'],
    loading: true,
    showModal: false,
    applyAnimalId: null,
    applyAnimalName: '',
    applyForm: { name: '', contact: '', reason: '' }
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
    if (kw) list = list.filter(a => (a.name||'').toLowerCase().includes(kw))
    this.setData({ animals: list })
  },

  showApply(e) {
    const { id, name } = e.currentTarget.dataset
    this.setData({
      showModal: true,
      applyAnimalId: id,
      applyAnimalName: name,
      applyForm: { name: '', contact: '', reason: '' }
    })
  },

  closeModal() {
    this.setData({ showModal: false })
  },

  async submitApply() {
    const f = this.data.applyForm
    if (!f.name || !f.contact) {
      wx.showToast({ title: '请填写姓名和联系方式', icon: 'none' }); return
    }
    try {
      await api.submitAdoption({
        animal_id: this.data.applyAnimalId,
        adopter_name: f.name,
        contact: f.contact,
        reason: f.reason
      })
      wx.showToast({ title: '申请已提交！' })
      this.closeModal()
    } catch (e) { console.error(e) }
  }
})
