export function request(req) {
  req.body = async () => {
    let responseData = ''
    for await (const data of req) {
      responseData += data
    }

    try {
      return JSON.parse(responseData)
    } catch (e) {
      throw new TypeError('Can not parse body.')
    }
  }

  return req
}
