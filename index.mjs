import {createServer} from 'http'
import Router from "./router.mjs";

Router.get('/user/[0-9]+', ({_req, res, params}) => {
  res.writeHead(200, {
    'Content-Type': 'application/json'
  })
  res.end(JSON.stringify([{
    message: 'deu boa!!',
    param: params.user
  }]))
})

Router.get('/user/id/[0-9]+/age/[0-9]+', ({req, res, params}) => {
  console.log('deu boa!!', params)
})

createServer((req, res) => {
  const {url, method} = req
  Router.emit({path: url, method, req, res})
})
  .listen(3000, () => {
  console.log('server is up')
})