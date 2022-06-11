export class Response {
  response = null
  headers = {}

  constructor(response) {
    this.response = response
    this.makeHeaders()
  }

  makeHeaders() {
    this.headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
      'Access-Control-Max-Age': 2592000 // 30 days
    }
  }

  json(payload) {
    this.response.setHeader('Content-Type', 'application/json')
    try{
      this.response.end(JSON.stringify(payload))
    } catch (e) {
      console.error(e)
    }
  }
}
