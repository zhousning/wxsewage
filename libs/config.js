//https://www.bafangjies.cn
//192.168.8.188:3000
var configs = {
  routes: {
    /*getUserId: 'https://www.bafangjie.cn/wx_users/get_userid',
    updateUser: 'https://www.bafangjie.cn/wx_users/',
    topOneHundred: 'https://www.bafangjie.cn/scores/top_one_hundred',
    addScore: 'https://www.bafangjie.cn/scores/add_score',
    getRank: 'https://www.bafangjie.cn/scores/get_rank'
    getUserId: 'http://192.168.43.7:3000/wx_users/get_userid',*/
    getUserId: 'http://192.168.2.163:3000/wx_users/get_userid',
    
    updateUser: 'http://192.168.2.163:3000/wx_users/',
    topOneHundred: 'http://192.168.8.188:3000/scores/top_one_hundred',
    addScore: 'http://192.168.8.188:3000/scores/add_score',
    getRank: 'http://192.168.8.188:3000/scores/get_rank'
  },
  games: {
    rankScore: 10,
    changeQuestionTime: 100,
    tollGate: 60
  }
}

module.exports = configs