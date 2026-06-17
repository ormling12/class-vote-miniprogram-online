Page({
  data: {
    title: '',
    description: '',
    options: ['', ''],
    maxVotes: 1,
    isAnonymous: true,
    expireDate: '',
    expireTime: ''
  },

  onLoad: function () {
    const now = new Date()
    const expireDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate() + 7).padStart(2, '0')}`
    const expireTime = '23:59'
    this.setData({ expireDate, expireTime })
  },

  inputTitle: function (e) {
    this.setData({ title: e.detail.value })
  },

  inputDesc: function (e) {
    this.setData({ description: e.detail.value })
  },

  inputOption: function (e) {
    const index = e.currentTarget.dataset.index
    const options = [...this.data.options]
    options[index] = e.detail.value
    this.setData({ options })
  },

  addOption: function () {
    if (this.data.options.length < 10) {
      this.setData({ options: [...this.data.options, ''] })
    }
  },

  removeOption: function (e) {
    const index = e.currentTarget.dataset.index
    if (this.data.options.length > 2) {
      const options = this.data.options.filter((_, i) => i !== index)
      this.setData({ options })
    }
  },

  toggleAnonymous: function () {
    this.setData({ isAnonymous: !this.data.isAnonymous })
  },

  selectMaxVotes: function (e) {
    this.setData({ maxVotes: parseInt(e.currentTarget.dataset.value) })
  },

  pickDate: function (e) {
    this.setData({ expireDate: e.detail.value })
  },

  pickTime: function (e) {
    this.setData({ expireTime: e.detail.value })
  },

  submitPoll: function () {
    if (!this.data.title.trim()) {
      wx.showToast({ title: '请输入投票标题', icon: 'none' })
      return
    }

    const validOptions = this.data.options.filter(opt => opt.trim())
    if (validOptions.length < 2) {
      wx.showToast({ title: '至少需要两个有效选项', icon: 'none' })
      return
    }

    if (!this.data.expireDate || !this.data.expireTime) {
      wx.showToast({ title: '请选择截止时间', icon: 'none' })
      return
    }

    wx.showLoading({ title: '创建中...' })

    wx.cloud.callFunction({
      name: 'createPoll',
      data: {
        title: this.data.title,
        description: this.data.description,
        options: validOptions,
        maxVotes: this.data.maxVotes,
        isAnonymous: this.data.isAnonymous,
        expireDate: this.data.expireDate,
        expireTime: this.data.expireTime
      }
    }).then(res => {
      wx.hideLoading()
      console.log('createPoll response:', res)
      if (res.result.success) {
        wx.showToast({ title: '创建成功', icon: 'success' })
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      } else {
        console.error('创建失败:', res.result)
        wx.showToast({ 
          title: res.result.message || '创建失败', 
          icon: 'none',
          duration: 3000 
        })
      }
    }).catch(err => {
      wx.hideLoading()
      console.error('云函数调用失败:', err)
      wx.showToast({ 
        title: '网络错误，请重试', 
        icon: 'none',
        duration: 3000 
      })
    })
  }
})