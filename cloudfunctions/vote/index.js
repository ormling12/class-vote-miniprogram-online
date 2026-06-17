const cloud = require('wx-server-sdk')

cloud.init({
  env: 'cloud1-d6gl742g6688a9b7c'
})

const db = cloud.database()

exports.main = async (event, context) => {
  const { pollId, options } = event
  const { OPENID, APPID } = cloud.getWXContext()

  console.log('vote function called:', { pollId, options, OPENID })

  try {
    console.log('Step 1: Getting poll data...')
    const pollRes = await db.collection('polls').doc(pollId).get()
    const poll = pollRes.data

    console.log('poll data:', poll)

    if (!poll) {
      console.log('Error: 投票不存在')
      return { success: false, message: '投票不存在' }
    }

    const now = Date.now()
    
    if (poll.expireAt && now > poll.expireAt) {
      console.log('Error: 投票已过期', { expireAt: poll.expireAt, now })
      await db.collection('polls').doc(pollId).update({
        data: { status: 'ended' }
      })
      return { success: false, message: '投票已过期' }
    }

    if (poll.status !== 'active') {
      console.log('Error: 投票状态不是active', { status: poll.status })
      return { success: false, message: '投票不存在或已结束' }
    }

    console.log('Step 2: Checking existing vote...')
    let existingVote = null
    try {
      existingVote = await db.collection('voteRecords')
        .where({ pollId, openId: OPENID })
        .get()
      console.log('existingVote result:', existingVote)
    } catch (voteErr) {
      console.warn('Error checking voteRecords:', voteErr)
    }
    
    if (existingVote && existingVote.data && existingVote.data.length > 0) {
      console.log('Error: 用户已投票')
      return { success: false, message: '您已参与过此投票' }
    }

    console.log('Step 3: Updating poll votes...')
    const updateData = {
      votes: db.command.addToSet(OPENID)
    }

    options.forEach(index => {
      updateData[`options.${index}.votes`] = db.command.inc(1)
    })

    console.log('updateData:', updateData)
    await db.collection('polls').doc(pollId).update({
      data: updateData
    })
    console.log('Poll updated successfully')

    console.log('Step 4: Adding vote record...')
    try {
      await db.collection('voteRecords').add({
        data: {
          pollId,
          openId: OPENID,
          options: options,
          createdAt: db.serverDate()
        }
      })
      console.log('Vote record added successfully')
    } catch (addErr) {
      console.warn('Error adding vote record:', addErr)
    }

    console.log('Vote successful!')
    return { success: true, message: '投票成功' }
  } catch (err) {
    console.error('投票失败', err)
    return { 
      success: false, 
      message: '投票失败，请重试', 
      error: err.message,
      errCode: err.errCode 
    }
  }
}