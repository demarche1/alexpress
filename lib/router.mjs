import {Response} from './Response.mjs'

const kHttpMethods = Symbol('httpMethods')
const kGetExactRoute = Symbol('getExactRoute')
const kGetDynamicRoute = Symbol('getDynamicRoute')
const kGetParams = Symbol('getParams')

class Router {
  response = null;
  [kHttpMethods] = {
    'GET': [],
    'not_found': []
  }

  get(url, cb) {
    this[kHttpMethods]['GET'][url] = this[kHttpMethods]['GET'][url] || []
    this[kHttpMethods]['GET'][url].push(cb)
  }

  notFound(cb) {
    this[kHttpMethods]['not_found'].push(cb)
  }

  [kGetExactRoute](url, method) {
    return Object
      .keys(this[kHttpMethods][method])
      .filter(route => route === url)
  }

  [kGetDynamicRoute](url, method) {
    return Object
      .keys(this[kHttpMethods][method])
      .filter(route => {
        const pattern = route.replace('/', '')
        const regex = new RegExp(`^${pattern}$`)

        if(regex.test(url.replace('/', ''))) {
          return url
        }
      })
  }

  [kGetParams](url, matchedPath) {
    const params = {}
    const splittedPath = url.split('/')
    splittedPath.shift()
    const splittedmatchedPath = matchedPath.split('/')
    splittedmatchedPath.shift()

    splittedPath.forEach((item, index) => {
      if(!splittedmatchedPath.includes(item)) {
        params[splittedPath[index-1]] = item
      }
    })

    return params
  }

  emit(req, res) {
    const {url, method} = req
    this.response = new Response(res)
    let matchedPath = this[kGetExactRoute](url, method) || []

    if(matchedPath.length === 0) {
      matchedPath = this[kGetDynamicRoute](url, method) || []

      if(!matchedPath[0]) {
        const cb = this[kHttpMethods]['not_found'][0]
        cb({req, res})
        return
      }

      const params = this[kGetParams](url, matchedPath[0])
      const [cb] = this[kHttpMethods][method][matchedPath[0]]

      cb({req , res: this.response, params})
   }
  }
}

export default new Router()