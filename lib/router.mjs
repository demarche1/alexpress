import {response} from './response.mjs'
import {request} from './request.mjs'

const kHttpMethods = Symbol('httpMethods')
const kGetExactRoute = Symbol('getExactRoute')
const kGetDynamicRoute = Symbol('getDynamicRoute')
const kGetParams = Symbol('getParams')
const kFormatParams = Symbol('formatParams')

class Router {
  [kHttpMethods] = {
    'GET': {},
    'POST': {},
    'PUT': {},
    'PATCH': {},
    'DELETE': {},
    'not_found': new Set()
  }

  get(...params) {
    let [url, middlewere, cb] = []
    if(params.length === 3) {
      [url, middlewere, cb] = params
    } else {
      [url, cb] = params
    }

    this[kHttpMethods]['GET'][url] = this[kHttpMethods]['GET'][url] || new Set()
    this[kHttpMethods]['GET'][url].add(cb)
    if(middlewere) {
      this[kHttpMethods]['GET'][url].add(middlewere)
    }
  }

  post(url, cb) {
    this[kHttpMethods]['POST'][url] = this[kHttpMethods]['POST'][url] || new Set()
    this[kHttpMethods]['POST'][url].add(cb)
  }

  put(url, cb) {
    this[kHttpMethods]['PUT'][url] = this[kHttpMethods]['PUT'][url] || new Set()
    this[kHttpMethods]['PUT'][url].add(cb)
  }

  patch(url, cb) {
    this[kHttpMethods]['PATCH'][url] = this[kHttpMethods]['PATCH'][url] || new Set()
    this[kHttpMethods]['PATCH'][url].add(cb)
  }

  delete(url, cb) {
    this[kHttpMethods]['DELETE'][url] = this[kHttpMethods]['DELETE'][url] || new Set()
    this[kHttpMethods]['DELETE'][url].add(cb)
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
        let pattern = route.replace('/', '')
        pattern = pattern.replaceAll(/:[a-zA-Z]+/g, '[a-zA-Z0-9]+')

        const regex = new RegExp(`^${pattern}$`)

        if(regex.test(url.replace('/', ''))) {
          return url
        }
      })
  }

  [kFormatParams](splittedmatchedPath, splittedPath) {
    const paramObj = {}
    splittedmatchedPath
      .map((item,index) => {
        if(item.charAt(0) === ':') {
          paramObj[item.replace(':', '')] = splittedPath[index]
        }
      })

    return paramObj
  }

  [kGetParams](url, matchedPath) {
    const splittedPath = url.split('/')
    splittedPath.shift()

    const splittedmatchedPath = matchedPath.split('/')
    splittedmatchedPath.shift()

    const params = this[kFormatParams](splittedmatchedPath, splittedPath)
    return params
  }

  async emit(req, res) {
    const {url, method} = req
    let matchedPath = this[kGetExactRoute](url, method) || []

    if(matchedPath.length === 0) {
      matchedPath = this[kGetDynamicRoute](url, method) || []

      if(!matchedPath[0]) {
        const [cb] = this[kHttpMethods]['not_found']
        return cb(request(req), response(res))
      }

      const params = this[kGetParams](url, matchedPath[0])
      const [cb, middlewere] = this[kHttpMethods][method][matchedPath[0]]

      let isNextCalled = null
      if(middlewere) {
        middlewere(request(req), response(res), () => isNextCalled = true)
      }

      if(middlewere && isNextCalled) {
        return await cb(request(req), response(res), params)
      }

      if(middlewere && !isNextCalled) {
        return
      }

      await cb(request(req), response(res), params)
    }

    const [cb] = this[kHttpMethods][method][matchedPath[0]]
    return await cb(request(res), response(res))
  }
}

export default new Router()
