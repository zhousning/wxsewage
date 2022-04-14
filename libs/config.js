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
    fcts: 'http://192.168.2.163:3000/wx_users/fcts',
    set_fct: 'http://192.168.2.163:3000/wx_users/set_fct',
  },
  games: {
    rankScore: 10,
    changeQuestionTime: 100,
    tollGate: 60
  }
}

module.exports = configs