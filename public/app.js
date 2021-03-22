var app = new Vue({
    el: '#app',
    data: {
        artistsData: [],
        page: 1,
        itemPerPage: 10,
        searchTerm: '',
        memberLow: 1,
        memberUp: 8,
        creationLow: 1955,
        creationUp: 2021,
        firstAlbum: "",
        date: "",
        suggestions: []
    },
    watch: {
        searchTerm: function () {
            this.suggestions= []
            let search = document.querySelector('.search-suggestions')
            if (this.searchTerm != "") {
                search.style.opacity=1
                search.style.pointerEvents="all"
                for (const artist of this.artistsData) {
                    //Band name filter
                    let foundInName = artist.name.toLowerCase().startsWith(this.searchTerm.toLowerCase())
                    if (foundInName == true) {
                        this.suggestions.push({
                            name: artist.name,
                            type: "Groupe",
                            id: artist.id
                        })
                    }
                    
                    //Band member name filter
                    for (const member of artist.members) {
                        if (member.toLowerCase().startsWith(this.searchTerm.toLowerCase())) {
                            this.suggestions.push({
                                name: member,
                                type: "Membre de "+ artist.name,
                                id: artist.id
                            })
                        }
                        
                    };
                }
                
            }else {
                search.style.opacity=0
                search.style.pointerEvents="none"
            }

            console.log(this.suggestions.slice(0,5))
        }
    },
    computed: {
        filteredArtist: function() {
            this.handleRange
            return this.artistsData
            .filter((artist) => {

                //Band member number filter
                let foundInNbr
                if (artist.members.length >= this.memberLow && artist.members.length <= this.memberUp) {
                    foundInNbr = true
                }else {
                    foundInNbr = false
                }
                
                //Band creation date filter
                let creationDate
                if (artist.creationDate >= this.creationLow && artist.creationDate <= this.creationUp) {
                    creationDate = true
                }else {
                    creationDate = false
                }
                
                //Band first album filter
                let foundAlbum = true

                let tmpDay = artist.firstAlbum.slice(0,2)
                let tmpMonth = artist.firstAlbum.slice(3,5)
                let tmpYear = artist.firstAlbum.slice(6,10)
                let tmp = new Date(tmpYear, parseInt(tmpMonth)-1, parseInt(tmpDay)+1).getTime()/1000
                console.log(tmpDay,tmpMonth, tmpYear, tmp)

                switch (this.firstAlbum) {
                    case "5" :
                        if (tmp < (this.date - 5* 365*24*3600)) {
                            foundAlbum = false
                        }
                        break
                    case "5-10":
                        if ((tmp < (this.date - 5* 365*24*3600)) && (tmp > (this.date - 10* 365*24*3600))) {
                            foundAlbum = true
                        }else {
                            foundAlbum = false
                        }
                        break
                    case "10-20":
                        if ((tmp < (this.date - 10* 365*24*3600)) && (tmp > (this.date - 20* 365*24*3600))) {
                            foundAlbum = true
                        }else {
                            foundAlbum = false
                        }
                        break
                    case "20-30":
                        if ((tmp < (this.date - 20* 365*24*3600)) && (tmp > (this.date - 30* 365*24*3600))) {
                            foundAlbum = true
                        }else {
                            foundAlbum = false
                        }
                        break
                    case "30-50":
                        if ((tmp < (this.date - 30* 365*24*3600)) && (tmp > (this.date - 50* 365*24*3600))) {
                            foundAlbum = true
                        }else {
                            foundAlbum = false
                        }
                        break
                    case "50-70":
                        if ((tmp < (this.date - 50* 365*24*3600)) && (tmp > (this.date - 70* 365*24*3600))) {
                            foundAlbum = true
                        }else {
                            foundAlbum = false
                        }
                        break
                }

                return creationDate && foundInNbr && foundAlbum
            })
        },
        shownArtists: function () {
            const end = this.page * this.itemPerPage;
            const start = end - this.itemPerPage;

            return this.filteredArtist.slice(start, end)
        },
        numberOfPage: function () {
            if (this.filteredArtist.length == 0) {
                document.querySelector('.artists-cards').style.display="none"
                document.querySelector('.no-result').style.display="flex"
            }else {
                document.querySelector('.artists-cards').style.display="grid"
                document.querySelector('.no-result').style.display="none"
            }
            return Math.ceil(this.filteredArtist.length/this.itemPerPage);
        },
        handleRange: function () {
            this.memberUp = parseInt(this.memberUp)
            this.memberLow = parseInt(this.memberLow)
            if (this.memberLow + 1> this.memberUp) {
                if (this.memberUp == 8) {
                    this.memberUp = this.memberUp
                    this.memberLow = this.memberLow -1
                }else {
                    var tmp = this.memberUp
                    this.memberUp = parseInt(this.memberLow) + 1
                    this.memberLow = tmp
                }
            }


            this.creationUp = parseInt(this.creationUp)
            this.creationLow = parseInt(this.creationLow)
            if (this.creationLow + 1> this.creationUp) {
                if (this.creationUp == 2021) {
                    this.creationUp = this.creationUp
                    this.creationLow = this.creationLow -1
                }else {
                    var tmp = this.creationUp
                    this.creationUp = parseInt(this.creationLow) + 1
                    this.creationLow = tmp
                }
            }
        },
    },
    created() {
        api = new Api()
        this.printCards()

        //Get current date

        this.date = new Date()
        this.date = this.date.getTime() / 1000
    },
    mounted() {
        //Handle Filter button
        let button = document.getElementById('filter')
        let filter = document.querySelector('.sidebar-genres')
        let filterShow =false
        button.addEventListener('click', function () {
            if (filterShow == false) {
                filter.style.opacity=1
                filter.style.pointerEvents="all"
                filter.style.transform= "translateY(0px)"
                filterShow = true
            }else if (filterShow == true) {
                filter.style.opacity=0
                filter.style.pointerEvents="none"
                filter.style.transform= "translateY(-20px)"
                filterShow = false
            }
        })
    },
    methods: {
        printCards: async function() {
            this.artistsData = await api.artists()
        },
    }
})