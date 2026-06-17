const cloud = require('wx-server-sdk')

cloud.init({
  env: 'cloud1-d6gl742g6688a9b7c'
})

const db = cloud.database()

exports.main = async (event, context) => {
  const { status = 'all', pageNum = 0, pageSize = 10 } = event

  try {
    const now = Date.now()
    
    let query = db.collection('polls')
    
    if (status === 'active') {
      query = query.where({
        status: 'active',
        expireAt: db.command.gt(now)
      })
    } else if (status === 'ended') {
      query = query.where({
        status: 'ended'
      })
    } else {
      query = query.where({})
    }
    
    query = query.orderBy('createdAt', 'desc')
      .skip(pageNum * pageSize)
      .limit(pageSize)

    const result = await query.get()
    
    const polls = result.data.map(poll => ({
      ...poll,
      totalVotes: poll.votes ? poll.votes.length : 0
    }))

    return {
      success: true,
      data: polls,
      hasMore: result.data.length === pageSize
    }
  } catch (err) {
    console.error('获取投票列表失败', err)
    return {
      success: false,
      message: '获取投票列表失败',
      error: err.message
    }
  }
}