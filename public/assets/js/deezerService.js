class Deezer {
  constructor() {
    this.link = "/deezer/"
  }

  async getFetch(option) {
    const result = await fetch(this.link + option)
    return await result.json()
  }

  async search(artistName) {
    return (await this.getFetch(`/search/artist?q=${artistName}&limit=1`)).data;
  }

  async top(artistId) {
    return (await this.getFetch(`/artist/${artistId}/top?&limit=3`)).data
  }
}