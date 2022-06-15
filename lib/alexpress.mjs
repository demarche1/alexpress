import {createServer} from 'http'
import Router from "./router.mjs";

const kMakeServer = Symbol('makeServer')
const kMakeRouter = Symbol('makeRouter')
const kDefaultHeaders = Symbol('defaultHeaders')
const kCustomHeaders = Symbol('customHeaders')
const DEFAULT_HEADERS = {
  origin: '*',
  methods: ['OPTIONS', 'POST', 'GET'],
  maxAge: 2592000
}

class Alexpress {
  router = null;
  server = null;
  [kDefaultHeaders] = {
    'Access-Control-Allow-Origin': DEFAULT_HEADERS.origin,
    'Access-Control-Allow-Methods': DEFAULT_HEADERS.methods.join(','),
    'Access-Control-Max-Age': DEFAULT_HEADERS.maxAge, // 30 days
  };
  [kCustomHeaders] = null;

  [kMakeServer]() {
    try {
      const headers = this[kCustomHeaders] || this[kDefaultHeaders]

      this.server = createServer(headers, Router.emit.bind(Router))
      return this
    } catch (e) {
      console.log(e)
    }
  }

  [kMakeRouter]() {
    this.router = Router
    return this
  }

  setHeaders({origin, methods, maxAge} = DEFAULT_HEADERS) {
    this[kCustomHeaders] = {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': methods,
      'Access-Control-Max-Age': maxAge
    }
  }
}

export default () => {
  return (
    new Alexpress()
    [kMakeRouter]()
    [kMakeServer]()
  )
}
