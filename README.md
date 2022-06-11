# Attempt to do routing lib like express.

# How to use?
```javascript
import alexpress from "./lib/alexpress.mjs";

const app = alexpress()
const server = app.server
const router = app.router

// ### Note!!! the dynamic params needs be RegExp ###
router.get('/user/[0-9]+', ({req, res, params}) => {

  return res.json(200, [{
    msg: 'Hello World!',
    params: [...params]
  }])

})

app.listen(300, () => { console.log('Server on!') })
```

### Todos

- [ ] Make a custom Request that retuns body parsed
- [ ] Tests
- [ ] Publish that lib on npm
- [ ] Middleweres
