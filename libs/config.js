var configs = {
  routes: {
    /*getUserId: 'https://www.bafangjie.cn/wx_users/get_userid',
    updateUser: 'https://www.bafangjie.cn/wx_users/',
    getUserId: 'http://192.168.43.7:3000/wx_users/get_userid',*/
    getUserId: 'http://192.168.43.7:3000/wx_users/get_userid',
    updateUser: 'http://192.168.43.7:3000/wx_users/',
    fcts: 'http://192.168.43.7:3000/wx_users/fcts',
    status: 'http://192.168.43.7:3000/wx_users/status',
    set_fct: 'http://192.168.43.7:3000/wx_users/set_fct',
    task_query_all: 'http://192.168.43.7:3000/wx_tasks/query_all',
    task_query_finish: 'http://192.168.43.7:3000/wx_tasks/query_finish',
  },
  games: {
    rankScore: 10,
    changeQuestionTime: 100,
    tollGate: 60
  }
}

module.exports = configs