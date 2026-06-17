Page({
  data: {
    polls: [],
    loading: true,
    hasMore: true,
    pageSize: 10,
    pageNum: 0
  },

  onLoad: function () {
    this.loadPolls()
  },

  onShow: function () {
    this.setData({ pageNum: 0, polls: [], hasMore: true })
    this.loadPolls()
  },

  loadPolls: function () {
    this.setData({ loading: true })
    
    wx.cloud.callFunction({
      name: 'getPollList',
      data: {
        pageNum: this.data.pageNum,
        pageSize: this.data.pageSize
      }
    }).then(res => {
      if (res.result.success) {
        const polls = res.result.data
        polls.forEach(poll => {
          poll.createdAt = this.formatDate(poll.createdAt)
        })
        this.setData({
          polls: this.data.pageNum === 0 ? polls : [...this.data.polls, ...polls],
          hasMore: res.result.hasMore,
          loading: false
        })
      } else {
        console.error('获取投票列表失败', res.result.message)
        this.setData({ loading: false })
      }
    }).catch(err => {
      console.error('获取投票列表失败', err)
      this.setData({ loading: false })
    })
  },

  onReachBottom: function () {
    if (this.data.hasMore && !this.data.loading) {
      this.setData({ pageNum: this.data.pageNum + 1 })
      this.loadPolls()
    }
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

  goToDetail: function (e) {
    const pollId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/poll/detail?id=${pollId}`
    })
  },

  goToCreate: function () {
    wx.navigateTo({
      url: '/pages/poll/create'
    })
  }
})