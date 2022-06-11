export function Response(res) {
  return {
    ...res,
    json(status, payload) {
      res.statusCode = status || 200
      res.setHeader('Content-Type', 'application/json')

      try{
        return res.end(JSON.stringify(payload))
      } catch (e) {
        throw new TypeError('Invalid payload')
        return
      }
    }
  }
}
