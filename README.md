# 班级匿名投票小程序

基于微信云开发的班级匿名投票应用，支持联机投票、实时统计。

## 功能特性

- 🔒 **匿名投票**：保护隐私，自由表达
- 📊 **实时统计**：投票结果实时更新
- 👥 **多人参与**：支持多人共享投票
- 🏆 **排行榜**：查看投票结果排名

## 技术栈

- 微信小程序
- 云开发（CloudBase）
- Node.js 云函数
- MongoDB 数据库

## 项目结构

```
├── cloudfunctions/     # 云函数
├── miniprogram/        # 小程序前端
│   ├── pages/         # 页面
│   ├── components/    # 组件
│   └── images/        # 图片资源
├── app.js             # 应用入口
└── project.config.json # 项目配置
```

## 云函数清单

| 云函数 | 功能 |
|--------|------|
| createPoll | 创建投票 |
| getPollList | 获取投票列表 |
| getPollDetail | 获取投票详情 |
| vote | 提交投票 |
| deletePoll | 删除投票 |
| updatePoll | 更新投票 |
| getMyPolls | 获取我的投票 |
| getVoteHistory | 获取投票历史 |
| checkVote | 检查投票状态 |
| initDB | 数据库初始化 |

## 数据库集合

| 集合 | 说明 |
|------|------|
| polls | 投票主表 |
| voteRecords | 投票记录表 |
| users | 用户信息表 |

## 开发环境

- AppID: wx6ea42d79d19f83a5
- 云环境: cloud1-d6gl742g6688a9b7c

## 部署说明

1. 在微信开发者工具中导入项目
2. 配置云开发环境
3. 创建数据库集合
4. 部署云函数
5. 配置集合权限

## 权限配置

### polls 集合
```json
{
  "read": true,
  "write": "doc._openid == auth.openid"
}
```

### voteRecords 集合
```json
{
  "read": false,
  "write": false
}
```

## License

MIT