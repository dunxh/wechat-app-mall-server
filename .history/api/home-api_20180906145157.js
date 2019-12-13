const moment = require('moment')
const mongoose = require('../mongoose')
const Like = mongoose.model('Like')
const Article = mongoose.model('Article')
const Category = mongoose.model('Category')
const marked = require('marked')

/**
 * 前台获得banner图片
 * @method
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
exports.getBannerList = (req, res) => {
    console.log(req.query)
	var list=[{'img':'https://wx.yogalt.com/file/images/banner.jpg'},{'img':'https://wx.yogalt.com/file/images/banner2.jpg'}]
    res.send(list)
}
/**
 * 前台获得推荐列表
 * @method
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
exports.getHotList = (req, res) => {
  const { by, id, key } = req.query
  let { limit, page } = req.query
  page = parseInt(page, 10)
  limit = parseInt(limit, 10)
  if (!page) page = 1
  if (!limit) limit = 10
  const data = {
          is_delete: 0
      },
      skip = (page - 1) * limit
  if (id) {
      data.category = id
  }
  if (key) {
      const reg = new RegExp(key, 'i')
      data.title = { $regex: reg }
  }
  let sort = '-update_date'
  if (by) {
      sort = '-' + by
  }

  const filds =
      'title content category category_name visit like likes comment_count creat_date update_date is_delete timestamp'

  Promise.all([
      Article.find(data, filds)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .exec(),
      Article.countAsync(data)
  ])
      .then(([data, total]) => {
          const totalPage = Math.ceil(total / limit)
          const user_id = req.cookies.userid || req.headers.userid
          const json = {
              code: 200,
              data: {
                  total,
                  hasNext: totalPage > page ? 1 : 0,
                  hasPrev: page > 1
              }
          }
          if (user_id) {
              data = data.map(item => {
                  item._doc.like_status = item.likes && item.likes.indexOf(user_id) > -1
                  item.content = item.content.substring(0, 500) + '...'
                  item.likes = []
                  return item
              })
              json.data.list = data
              res.json(json)
          } else {
              data = data.map(item => {
                  item._doc.like_status = false
                  item.content = item.content.substring(0, 500) + '...'
                  item.likes = []
                  return item
              })
              json.data.list = data
              res.json(json)
          }
      })
      .catch(err => {
          res.json({
              code: -200,
              message: err.toString()
          })
      })

}

