import {Response} from './response.mjs'
import {Request} from './request.mjs'

const kHttpMethods = Symbol('httpMethods')
const kGetExactRoute = Symbol('getExactRoute')
const kGetDynamicRoute = Symbol('getDynamicRoute')
const kGetParams = Symbol('getParams')

const getArrayDifference = (arr1, arr2) => {
  const setArr = new Set([...arr1])
  const setArr2 = new Set([...arr2])

  return new Set([...setArr]
    .filter(item => !setArr2.has(item)))
}

class Router {
  response = null;
  request = null;
  [kHttpMethods] = {
    'GET': [],
    'POST': [],
    'not_found': new Set()
  }

  get(url, cb) {
    this[kHttpMethods]['GET'][url] = this[kHttpMethods]['GET'][url] || new Set()
    this[kHttpMethods]['GET'][url].add(cb)
  }

  post(url, cb) {
    this[kHttpMethods]['POST'][url] = this[kHttpMethods]['POST'][url] || new Set()
    this[kHttpMethods]['POST'][url].add(cb)
  }

  notFound(cb) {
    this[kHttpMethods]['not_found'].add(cb)
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
    const splittedPath = url.split('/')
    splittedPath.shift()
    const splittedmatchedPath = matchedPath.split('/')
    splittedmatchedPath.shift()

    const params = getArrayDifference(splittedPath,splittedmatchedPath )

    return params
  }

  async emit(req, res) {
    const {url, method} = req
    this.response = Response(res)
    this.request = Request(req)
    let matchedPath = this[kGetExactRoute](url, method) || []

    if(matchedPath.length === 0) {
      matchedPath = this[kGetDynamicRoute](url, method) || []

      if(!matchedPath[0]) {
        const [cb] = this[kHttpMethods]['not_found']
        cb({req, res: this.response})
        return
      }

      const params = this[kGetParams](url, matchedPath[0])
      const [cb] = this[kHttpMethods][method][matchedPath[0]]

      await cb({req, res: this.response, params})
   }
  }
}

export default new Router()
