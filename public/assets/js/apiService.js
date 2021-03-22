class Api {
  constructor() {
    this.link = "/api/"
  }

  async getFetch(option) {
    if (option == undefined) {
      option = ""
    }
    const result = await fetch(this.link + option)
    const data = await result.json()
    return data
  }

  artists(id) {
    if (id == undefined) {
      return this.getFetch("artists")
    } else {
      return this.getFetch("artists/" + id)
    }
  }

  async date(id) {
    if (id == undefined) {
      const data = await this.getFetch("dates")
      return data.index
    }else {
      return this.getFetch("dates/" + id)
    }
  }

  async locations(id) {
    if (id == undefined) {
      const data = await this.getFetch("locations")
      return data.index
    } else {
      return this.getFetch("locations/" + id)
    }
  }

  async relation(id) {
    if (id == undefined) {
      const data = await this.getFetch("relation")
      return data.index  
    }else {
      return this.getFetch("relation/"+id)
    } 
  }
}