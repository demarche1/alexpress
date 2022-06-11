export function Request(req) {
  return {
    ...req,
    async body() {
      for await (const data of req) {
      try {
        return JSON.parse(data)
      } catch (e) {
        throw new TypeError('Can not parse body.')
      }
    }
    }
  }
}
