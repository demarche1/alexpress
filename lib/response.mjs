import {safeJsonStringfy} from './utils/index.mjs'

export function response(res) {
  res.json = (status, payload) => {
    res.statusCode = status || 200

    res.setHeader('Content-Type', 'application/json')
    res.end(safeJsonStringfy(payload, 'Inválid payload'))
  }
  res.ok = (payload) => {
    res.setHeader('Content-Type', 'application/json')
    res.end(safeJsonStringfy(payload, 'Inválid payload'))
  }

  return res
}
