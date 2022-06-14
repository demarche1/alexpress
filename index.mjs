import alexpress from "./lib/alexpress.mjs";

const app = alexpress()
const server = app.server
const router = app.router

router.get('/user/:id', (_req, res, params) => {
  return res.json(200, [{
    msg: 'deu boa!!',
    params
  }])
})

const auth = (req, res, next) => {
  next()
}

router.get('/user/:id/age/:idade/name/:nome', auth, (_req, res, params) => {
  return res.json(201, [{
    msg: 'deu boa!!',
    params
  }])
})

router.post('/user/:id/age/:age',  async (req, res, params) => {
  const body = await req.body()

  res.ok({
    body,
    params
  })
})

router.notFound((_req, res) => {
  return res.json(404, [{
    message: 'Not-Found'
  }])
})

server.listen(3000, () => {
  console.log('Server is up')
})