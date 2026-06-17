Page({
  data: {
    pollCount: 0,
    voteCount: 0,
    recentPolls: []
  },

  onLoad: function () {
    this.loadStats()
    this.loadRecentPolls()
  },

  onShow: function () {
    this.loadStats()
    this.loadRecentPolls()
  },

  loadStats: function () {
    wx.cloud.callFunction({
      name: 'getPollList',
      data: { pageNum: 0, pageSize: 100 }
    }).then(res => {
      if (res.result.success) {
        let totalVotes = 0
        res.result.data.forEach(poll => {
          totalVotes += poll.votes ? poll.votes.length : 0
        })
        this.setData({
          pollCount: res.result.total,
          voteCount: totalVotes
        })
      }
    }).catch(err => {
      console.error('获取统计数据失败', err)
    })
  },

  loadRecentPolls: function () {
    wx.cloud.callFunction({
      name: 'getPollList',
      data: { pageNum: 0, pageSize: 3 }
    }).then(res => {
      if (res.result.success) {
        const polls = res.result.data.map(poll => ({
          ...poll,
          totalVotes: poll.votes ? poll.votes.length : 0
        }))
        this.setData({ recentPolls: polls })
      }
    }).catch(err => {
      console.error('获取最近投票失败', err)
    })
  },

  goToCreate: function () {
    wx.navigateTo({
      url: '/pages/poll/create'
    })
  },

  goToPollList: function () {
    wx.switchTab({
      url: '/pages/poll/list'
    })
  },

  goToDetail: function (e) {
    const pollId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/poll/detail?id=${pollId}`
    })
  }
})