import alexpress from "./lib/alexpress.mjs";

const app = alexpress()
const server = app.server
const router = app.router

router.get('/user/[0-9]+', ({_req, res, params}) => {
  return res.json([{
    msg: 'deu boa!!',
    params
  }])
})

router.notFound(({_req, res}) => {
  res.writeHead(404, {
    'Content-Type': 'application/json'
  })
  return res.end(JSON.stringify({
    message: 'Not-Found'
  }))
})

server.listen(3000, () => {
  console.log('Server is up')
})