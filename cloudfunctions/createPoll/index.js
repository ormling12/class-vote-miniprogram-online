const cloud = require('wx-server-sdk')

cloud.init({
  env: 'cloud1-d6gl742g6688a9b7c'
})

const db = cloud.database()

exports.main = async (event, context) => {
  const { title, description, options, maxVotes, isAnonymous, expireDate, expireTime } = event
  const { OPENID, APPID } = cloud.getWXContext()

  console.log('createPoll called with:', {
    title,
    description,
    options,
    maxVotes,
    isAnonymous,
    expireDate,
    expireTime,
    OPENID
  })

  try {
    if (!title || !title.trim()) {
      console.log('Error: 请输入投票标题')
      return { success: false, message: '请输入投票标题' }
    }

    const validOptions = options.filter(opt => opt && opt.trim())
    if (validOptions.length < 2) {
      console.log('Error: 至少需要两个选项')
      return { success: false, message: '至少需要两个选项' }
    }

    const expireAt = new Date(`${expireDate} ${expireTime}`).getTime()
    const now = Date.now()
    
    if (expireAt <= now) {
      console.log('Error: 过期时间必须大于当前时间', { expireAt, now })
      return { success: false, message: '过期时间必须大于当前时间' }
    }

    console.log('准备写入数据库...')
    const result = await db.collection('polls').add({
      data: {
        title: title.trim(),
        description: description ? description.trim() : '',
        options: validOptions.map(text => ({ text: text.trim(), votes: 0 })),
        maxVotes: maxVotes || 1,
        isAnonymous: isAnonymous !== undefined ? isAnonymous : true,
        status: 'active',
        createdAt: db.serverDate(),
        expireAt: expireAt,
        createdBy: OPENID,
        votes: []
      }
    })

    console.log('创建成功，pollId:', result._id)
    return {
      success: true,
      message: '创建成功',
      pollId: result._id
    }
  } catch (err) {
    console.error('创建投票失败', err)
    return {
      success: false,
      message: '创建失败，请重试',
      error: err.message,
      errCode: err.errCode
    }
  }
}