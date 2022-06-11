const kEvents = Symbol('events')
const kGetExactRoute = Symbol('getExactRoute')
const kGetDynamicRoute = Symbol('getDynamicRoute')
const kGetParams = Symbol('getParams')

class Router {
  [kEvents] = {
    'GET': []
  }

  get(path, cb) {
    this[kEvents]['GET'][path] = this[kEvents]['GET'][path] || []
    this[kEvents]['GET'][path].push(cb)
  }

  [kGetExactRoute](path, method) {
    return Object
      .keys(this[kEvents][method])
      .filter(route => route === path)
  }

  [kGetDynamicRoute](path, method) {
    return Object
      .keys(this[kEvents][method])
      .filter(route => {
        const pattern = route.replace('/', '')
        const regex = new RegExp(`^${pattern}$`)

        if(regex.test(path.replace('/', ''))) {
          return path
        }
      })
  }

  [kGetParams](path, matchedPath) {
    const params = {}
    const splittedPath = path.split('/')
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

  emit({path, method, req, res}) {
    let matchedPath = this[kGetExactRoute](path, method) || []

    if(matchedPath.length === 0) {
      matchedPath = this[kGetDynamicRoute](path, method) || []

      if(!matchedPath[0]) {
        res.writeHead(404, {
         'Content-Type': 'application/json'
       })
       return res.end(JSON.stringify({
         message: 'Not-Found'
       }))
      }

      const params = this[kGetParams](path, matchedPath[0])
      const [cb] = this[kEvents][method][matchedPath[0]]

      cb({req, res, params})
   }
  }
}

export default new Router()