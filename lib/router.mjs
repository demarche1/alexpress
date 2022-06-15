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

  flattenArgs(args) {
    if(!args) throw new Error('Without arguments')

    const url = args.shift()
    const cb = args.pop()

    const allArgs = {
      url,
      cb
    }

    for (let i = 0; i < args.length; i++) {
      allArgs.middleweres = allArgs.middleweres || []
      allArgs.middleweres.push(args[i])
    }

    return allArgs
  }

  routerSetupHandler(method, args) {
    const {url, cb, middleweres} = this.flattenArgs(args)

    this[kHttpMethods][method][url] = this[kHttpMethods][method][url] || new Set()
    this[kHttpMethods][method][url].add(cb)

    if(middleweres && middleweres.length) {
      this[kHttpMethods][method][url].add(middleweres)
    }
  }

  get(...args) {
    this.routerSetupHandler('GET', args)
  }

  post(...args) {
    this.routerSetupHandler('POST', args)
  }

  put(...args) {
    this.routerSetupHandler('PUT', args)
  }

  patch(...args) {
    this.routerSetupHandler('PATCH', args)
  }

  delete(...args) {
    this.routerSetupHandler('DELETE', args)
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
        let pattern = route
          .replace('/', '')
          .replaceAll(/:[a-zA-Z]+/g, '[a-zA-Z0-9]+')

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
    const cRequest = request(req)
    const cResponse = response(res)
    let matchedPath = this[kGetExactRoute](url, method) || []

    if(matchedPath.length === 0) {
      matchedPath = this[kGetDynamicRoute](url, method) || []

      if(!matchedPath[0]) {
        const [cb] = this[kHttpMethods]['not_found']
        return cb(cRequest, cResponse)
      }

      const params = this[kGetParams](url, matchedPath[0])
      const [cb, middleweres] = this[kHttpMethods][method][matchedPath[0]]

      let isNextCalled = []
      if(middleweres && middleweres.length) {
        middleweres.forEach(middlewere => {
          middlewere(cRequest, cResponse, () => isNextCalled.push(true))
        })
      }

      const isAllNextCbWasCalled =
        middleweres && middleweres.length && isNextCalled.length === middleweres.length

      if(isAllNextCbWasCalled) {
        return await cb(cRequest, cResponse, params)
      }

      if(middleweres && middleweres.length && !isAllNextCbWasCalled) return

      return await cb(cRequest, cResponse, params)
    }

    const [cb] = this[kHttpMethods][method][matchedPath[0]]
    return await cb(cRequest, cResponse)
  }
}

export default new Router()
