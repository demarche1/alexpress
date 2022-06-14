export function safeJsonStringfy(payload, msg) {
  try{
    return JSON.stringify(payload)
  } catch (e) {
    throw new TypeError(msg)
  }
}
