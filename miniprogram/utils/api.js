/**
 * API 服务层 - 微信小程序版
 * 封装所有后端接口调用
 */

const app = getApp()

function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    wx.showNavigationBarLoading()
    wx.request({
      url: app.globalData.API_BASE + url,
      method: options.method || 'GET',
      data: options.data,
      header: {
        'Content-Type': 'application/json',
        ...options.header
      },
      success(res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data)
        } else {
          wx.showToast({ title: res.data?.message || '请求失败', icon: 'none' })
          reject(res.data)
        }
      },
      fail(err) {
        wx.showToast({ title: '网络错误，请检查服务器', icon: 'none' })
        reject(err)
      },
      complete() {
        wx.hideNavigationBarLoading()
      }
    })
  })
}

// ====== 统计 ======
function getStats() {
  return request('/stats')
}

// ====== 动物列表 ======
function getAnimals() {
  return request('/animals')
}

function getAnimal(id) {
  return request(`/animals/${id}`)
}

function createAnimal(data) {
  return request('/animals', {
    method: 'POST',
    data
  })
}

function updateAnimal(id, data) {
  return request(`/animals/${id}`, {
    method: 'PUT',
    data
  })
}

function deleteAnimal(id) {
  return request(`/animals/${id}`, {
    method: 'DELETE'
  })
}

// ====== 最新动物 ======
function getLatestAnimals() {
  return request('/stats/latest')
}

// ====== 搜索 ======
function searchAnimals(query) {
  return request(`/animals/search/query?query=${encodeURIComponent(query)}`)
}

function filterBySpecies(species) {
  return request(`/animals/filter/species?species=${encodeURIComponent(species)}`)
}

// ====== 地图 ======
function getMapData() {
  return request('/map')
}

function filterMapData(species) {
  return request(`/map/filter?species=${encodeURIComponent(species)}`)
}

// ====== 上传图片 ======
function uploadImage(filePath) {
  return new Promise((resolve, reject) => {
    wx.showLoading({ title: '上传中...' })
    wx.uploadFile({
      url: app.globalData.API_BASE + '/upload',
      filePath: filePath,
      name: 'image',
      success(res) {
        if (res.statusCode === 200) {
          resolve(JSON.parse(res.data))
        } else {
          wx.showToast({ title: '上传失败', icon: 'none' })
          reject(res)
        }
      },
      fail(err) {
        wx.showToast({ title: '上传失败', icon: 'none' })
        reject(err)
      },
      complete() {
        wx.hideLoading()
      }
    })
  })
}

// ====== 领养 ======
function getAdoptions() {
  return request('/adoptions')
}
function getAnimalAdoptions(animalId) {
  return request(`/adoptions/animal/${animalId}`)
}
function submitAdoption(data) {
  return request('/adoptions', { method: 'POST', data })
}
function updateAdoptionStatus(id, status) {
  return request(`/adoptions/${id}`, { method: 'PUT', data: { status } })
}

// ====== 评论 ======
function getComments(animalId) {
  return request(`/comments/animal/${animalId}`)
}
function postComment(data) {
  return request('/comments', { method: 'POST', data })
}
function deleteComment(id) {
  return request(`/comments/${id}`, { method: 'DELETE' })
}

module.exports = {
  getStats, getAnimals, getAnimal, createAnimal,
  updateAnimal, deleteAnimal,
  getLatestAnimals, searchAnimals, filterBySpecies,
  getMapData, filterMapData, uploadImage,
  getAdoptions, getAnimalAdoptions, submitAdoption, updateAdoptionStatus,
  getComments, postComment, deleteComment
}
