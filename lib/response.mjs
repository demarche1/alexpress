import {safeJsonStringfy} from './utils/index.mjs'

export function response(res) {
  res.setHeader('Content-Type', 'application/json')

  res.json = (status, payload) => {
    res.statusCode = status || 200
    res.end(safeJsonStringfy(payload, 'Inválid payload'))
  }
  res.ok = (payload) => {
    res.end(safeJsonStringfy(payload, 'Inválid payload'))
  }

  return res
}
