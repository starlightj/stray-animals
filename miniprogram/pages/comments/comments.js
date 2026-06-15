const api = require('../../utils/api')

Page({
  data: {
    animalId: null,
    animalName: '',
    list: [],
    loading: true,
    form: { nickname: '', content: '' }
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ animalId: options.id, animalName: options.name || '未知动物' })
      this.loadComments()
    }
  },

  async loadComments() {
    this.setData({ loading: true })
    try {
      const list = await api.getComments(this.data.animalId)
      this.setData({ list, loading: false })
    } catch (e) { this.setData({ loading: false }) }
  },

  async submitComment() {
    const f = this.data.form
    if (!f.content.trim()) {
      wx.showToast({ title: '请输入评论内容', icon: 'none' }); return
    }
    try {
      const comment = await api.postComment({
        animal_id: this.data.animalId,
        nickname: f.nickname || '匿名用户',
        content: f.content
      })
      // 插入到列表最前面
      const list = [comment, ...this.data.list]
      this.setData({ list, 'form.content': '', 'form.nickname': f.nickname })
      wx.showToast({ title: '评论成功' })
    } catch (e) { console.error(e) }
  }
})
