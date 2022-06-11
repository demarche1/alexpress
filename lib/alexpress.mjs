import {createServer} from 'http'
import Router from "./router.mjs";

const kMakeServer = Symbol('makeServer')
const kMakeRouter = Symbol('makeRouter')

class Alexpress {
  router = null;
  server = null;

  [kMakeServer]() {
    this.server = createServer(Router.emit.bind(Router))
    return this
  }

  [kMakeRouter]() {
    this.router = Router
    return this
  }
}

export default () => {
  return (
    new Alexpress()
    [kMakeRouter]()
    [kMakeServer]()
  )
}