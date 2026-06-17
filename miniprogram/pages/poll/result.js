Page({
  data: {
    poll: null,
    loading: true,
    rankings: []
  },

  onLoad: function (options) {
    if (options.id) {
      this.getPollResult(options.id)
    }
  },

  getPollResult: function (pollId) {
    this.setData({ loading: true })
    
    wx.cloud.callFunction({
      name: 'getPollDetail',
      data: { pollId }
    }).then(res => {
      if (res.result.success) {
        let poll = res.result.data
        poll.createdAt = this.formatDate(poll.createdAt)
        
        const rankings = (poll.options || []).map((opt, index) => ({
          index: index + 1,
          text: opt.text,
          votes: opt.votes || 0,
          percentage: poll.totalVotes > 0 ? ((opt.votes || 0) / poll.totalVotes * 100).toFixed(1) : 0
        })).sort((a, b) => b.votes - a.votes)

        this.setData({ poll, rankings, loading: false })
      } else {
        console.error('获取投票结果失败', res.result.message)
        this.setData({ loading: false })
      }
    }).catch(err => {
      console.error('获取投票结果失败', err)
      this.setData({ loading: false })
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

  getRankIcon: function (rank) {
    const icons = ['🥇', '🥈', '🥉']
    return icons[rank - 1] || `第${rank}名`
  },

  sharePoll: function () {
    return {
      title: this.data.poll.title,
      path: `/pages/poll/detail?id=${this.data.poll._id}`
    }
  }
})