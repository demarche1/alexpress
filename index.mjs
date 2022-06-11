import alexpress from "./lib/alexpress.mjs";

const app = alexpress()
const server = app.server
const router = app.router

router.get('/user/[0-9]+', ({_req, res, params}) => {
  return res.json(200, {
    msg: 'Deu boa!!',
    params: [...params]
  })
})

router.get('/user/[0-9]+/age/[0-9]+', ({_req, res, params}) => {
  return res.json(200, [{
    msg: 'deu boa!!',
    params: [...params]
  }])
})

router.post('/user/[0-9]+/age/[0-9]+',  async ({req, res, params}) => {
  const payload = {
    msg: 'deu boa!!',
    params: [...params],
    body: {}
  }

  for await (const data of req) {
    try {
      payload.body = JSON.parse(data)
    } catch (e) {
      throw new TypeError('Can not parse body.')
      return
    }
  }

  res.json(null, payload)
})

router.notFound(({_req, res}) => {
  return res.json(404, [{
    message: 'Not-Found'
  }])
})

server.listen(3000, () => {
  console.log('Server is up')
})