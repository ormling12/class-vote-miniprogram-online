Page({
  data: {
    poll: null,
    selectedOptions: [],
    hasVoted: false,
    loading: true,
    errorMsg: ''
  },

  onLoad: function (options) {
    console.log('detail onLoad:', options)
    if (options && options.id) {
      this.getPollDetail(options.id)
    } else {
      this.setData({ 
        loading: false, 
        errorMsg: '参数错误' 
      })
    }
  },

  onShareAppMessage: function () {
    if (this.data.poll) {
      return {
        title: this.data.poll.title,
        path: `/pages/poll/detail?id=${this.data.poll._id}`
      }
    }
    return {
      title: '邀请你参与投票',
      path: '/pages/poll/list'
    }
  },

  getPollDetail: function (pollId) {
    this.setData({ loading: true, errorMsg: '' })
    
    wx.cloud.callFunction({
      name: 'getPollDetail',
      data: { pollId }
    }).then(res => {
      console.log('getPollDetail response:', res)
      if (res.result.success) {
        let poll = res.result.data
        poll.createdAt = this.formatDate(poll.createdAt)
        this.setData({ 
          poll, 
          hasVoted: poll.hasVoted,
          loading: false 
        })
      } else {
        console.error('获取投票详情失败', res.result.message)
        this.setData({ 
          loading: false, 
          errorMsg: res.result.message 
        })
        wx.showToast({ 
          title: res.result.message || '投票不存在', 
          icon: 'none',
          duration: 2000
        })
      }
    }).catch(err => {
      console.error('获取投票详情失败', err)
      this.setData({ 
        loading: false, 
        errorMsg: '网络错误' 
      })
      wx.showToast({ title: '网络错误', icon: 'none' })
    })
  },

  formatDate: function (date) {
    if (!date) return ''
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hour = String(d.getHours()).padStart(2, '0')
    const minute = String(d.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day} ${hour}:${minute}`
  },

  selectOption: function (e) {
    if (!this.data.poll || this.data.hasVoted || this.data.poll.status !== 'active') return
    
    const index = e.currentTarget.dataset.index
    let selectedOptions = [...this.data.selectedOptions]
    
    if (this.data.poll.maxVotes === 1) {
      selectedOptions = [index]
    } else {
      const idx = selectedOptions.indexOf(index)
      if (idx > -1) {
        selectedOptions.splice(idx, 1)
      } else if (selectedOptions.length < this.data.poll.maxVotes) {
        selectedOptions.push(index)
      }
    }
    
    this.setData({ selectedOptions })
  },

  submitVote: function () {
    if (this.data.selectedOptions.length === 0) {
      wx.showToast({ title: '请选择选项', icon: 'none' })
      return
    }

    wx.showLoading({ title: '提交中...' })
    
    const that = this
    wx.cloud.callFunction({
      name: 'vote',
      data: {
        pollId: this.data.poll._id,
        options: this.data.selectedOptions
      }
    }).then(res => {
      wx.hideLoading()
      if (res.result.success) {
        wx.showToast({ title: '投票成功', icon: 'success' })
        setTimeout(() => {
          that.setData({ hasVoted: true, selectedOptions: [] })
          that.getPollDetail(that.data.poll._id)
        }, 1500)
      } else {
        wx.showToast({ 
          title: res.result.message || '投票失败', 
          icon: 'none',
          duration: 3000
        })
      }
    }).catch(err => {
      wx.hideLoading()
      console.error('投票失败', err)
      wx.showToast({ title: '网络错误，请重试', icon: 'none' })
    })
  },

  goToResult: function () {
    if (!this.data.poll) return
    wx.navigateTo({
      url: `/pages/poll/result?id=${this.data.poll._id}`
    })
  },

  goBack: function () {
    wx.navigateBack({
      fail: () => {
        wx.switchTab({ url: '/pages/poll/list' })
      }
    })
  },

  retry: function () {
    if (this.data.poll) {
      this.getPollDetail(this.data.poll._id)
    }
  }
})