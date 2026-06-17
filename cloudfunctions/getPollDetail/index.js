const cloud = require('wx-server-sdk')

cloud.init({
  env: 'cloud1-d6gl742g6688a9b7c'
})

const db = cloud.database()

exports.main = async (event, context) => {
  const { pollId } = event
  const { OPENID } = cloud.getWXContext()

  console.log('getPollDetail called:', { pollId, OPENID })

  try {
    if (!pollId) {
      return { success: false, message: '投票ID不能为空' }
    }

    const result = await db.collection('polls').doc(pollId).get()
    
    console.log('poll result:', result)
    
    if (!result.data) {
      return { success: false, message: '投票不存在' }
    }

    let poll = result.data
    const now = Date.now()
    
    if (poll.status === 'active' && poll.expireAt && now > poll.expireAt) {
      await db.collection('polls').doc(pollId).update({
        data: { status: 'ended' }
      })
      poll.status = 'ended'
    }

    poll.totalVotes = poll.votes ? poll.votes.length : 0
    poll.options = poll.options || []
    
    poll.options.forEach(opt => {
      opt.percentage = poll.totalVotes > 0 ? 
        ((opt.votes || 0) / poll.totalVotes * 100).toFixed(1) : 0
    })

    let hasVoted = false
    try {
      const voteRecord = await db.collection('voteRecords')
        .where({ pollId, openId: OPENID })
        .get()
      
      hasVoted = voteRecord.data && voteRecord.data.length > 0
    } catch (voteErr) {
      console.warn('Error checking vote record:', voteErr)
      hasVoted = poll.votes && poll.votes.includes(OPENID)
    }
    
    poll.hasVoted = hasVoted

    return {
      success: true,
      data: poll
    }
  } catch (err) {
    console.error('获取投票详情失败', err)
    return {
      success: false,
      message: '获取投票详情失败',
      error: err.message
    }
  }
}