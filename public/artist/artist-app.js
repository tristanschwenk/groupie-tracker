var artistApp = new Vue({
  el: '#artist-app',
  data: {
    artistData: [],
    relations: [],
    chartPoint: [],
    top: [],
    play0: false,
    pause0: "",
    playerControl: {
      title: "Titre",
      artist: "Artiste",
      currentTime: "00:00",
      currentSlide: null,
      totalTime: "",
      volume: 1,
      index: null,
      interval: null
    }

  },
  created() {
    api = new Api()
    deezer = new Deezer()
    this.page = window.location.search.slice(1)
    this.getArtist()

  },
  computed: {
    isVolumeMute() { return this.playerControl.volume == 0},
    isVolumeLow() { return this.playerControl.volume > 0 && this.playerControl.volume < 0.5},
    isVolumeHigh() {return this.playerControl.volume >= 0.5},
    volume() {return this.playerControl.volume}
  },
  watch: {
    volume() {
      console.log("volume =>", this.volume, this.playerControl.index)
      let audio = document.getElementById(this.playerControl.index)
      audio.volume = this.volume
    } 
  },
  methods: {
    getArtist: async function () {
      this.artistData = await api.artists(this.page)
      console.log(this.artistData)
      this.relations = await api.relation(this.page)
      this.relations = this.relations.datesLocations

      //Change background image
      let card = document.querySelector('.artist-header')
      let response = await fetch("../assets/js/extension.json")
      let image = await response.json()
      card.style.backgroundImage = `url("${image[(this.artistData.id)-1].image}")`

      this.addToChart()
      this.getDeezer()

    },
    getDeezer: async function () {
      let id = (await deezer.search(this.artistData.name))[0].id
      this.top = await deezer.top(id)
      console.log(this.top)
    },
    getPlay: function (name, songId) {
      let audio = document.getElementById(songId)
      
      this.playerControl.totalTime = "00:"+~~(audio.duration)
      this.playerControl.index = songId
      //Get both bottons to change plus audio
      let player = document.querySelector('.player')
      let current = document.getElementById(`${name}`)
      let opposite = document.querySelector(`button[data-opposite="${name}"]`)
      current.style.display = 'none'
      opposite.style.display = 'block'

      //Decide weather to play or pause audio + smooth volume
      if (name.slice(0, 4) == "play") {
        audio.play()
        audio.volume = 0.0
        var fadeInVolume = setInterval(function () {
          if ((audio.volume + 0.2) > 1) {
            audio.volume += 1 - audio.volume
          } else {
            audio.volume += 0.2
          }
          if (audio.volume == 1.0) {
            clearInterval(fadeInVolume)
          }
        }, 100)

        //Pause every others
        let tracks = document.querySelectorAll('.track')
        tracks.forEach(song => {
          let currentSong = song.querySelector('audio')
          let play = song.querySelector('.play')
          let pause = song.querySelector('.pause')
          if (currentSong.id != audio.id) {
            currentSong.pause()
            play.style.display = "block"
            pause.style.display = "none"
          }
        });
        //Pull up player
        //Change playerControlspec
        this.playerControl.title = this.top[name.slice(-1)].title_short
        this.playerControl.artist = this.top[name.slice(-1)].artist.name
        document.querySelector('.player-image').style.backgroundImage = `url(${this.top[name.slice(-1)].album.cover})`
        player.style.opacity = 1
        player.style.pointerEvents = "all"
        player.style.transform = "translateY(0px)"
        
        clearInterval(this.playerControl.interval);
        this.playerControl.interval = setInterval(()=>this.updateCurrentTime(audio),500 )
      } else { //Pause section
        //Pull down player
        player.style.opacity = 0
        player.style.pointerEvents = "none"
        player.style.transform = "translateY(20px)"
        var fadeOutVolume = setInterval(function () {
          if ((audio.volume - 0.2) < 0) {
            audio.volume -= audio.volume
          } else {
            audio.volume -= 0.2
          }
          if (audio.volume == 0) {
            audio.pause()
            clearInterval(fadeOutVolume)
          }
        }, 50)
      }

    },
    updateCurrentTime(audio) {
      console.log('-->', audio.id, audio.currentTime);
      if (audio.currentTime < 10) {
        this.playerControl.currentTime = "00:0"+~~audio.currentTime  
      }else {
        this.playerControl.currentTime = "00:"+~~audio.currentTime  
      }
      this.playerControl.currentSlide = audio.currentTime  
    },
    addToChart: async function () {
      const keys = Object.keys(this.relations)
      const values = Object.values(this.relations)
      for (let index = 0; index < keys.length; index++) {
        let api = `https://api.opencagedata.com/geocode/v1/json?q=${keys[index]}&key=db14e16f2d1f497e85d04da72407bb1c`
        let response = await fetch(api)
        let resp = await response.json()
        let coords = resp.results[0].geometry
        let i = keys[index].indexOf('-')
        let city = keys[index].slice(0, i).replaceAll('_', '\n').replace(/(^\w|\s\w)/g, m => m.toUpperCase())

        //Get the different dates for same place in a string that handle line return
        let dates = values[index]
        let datesStr = ""
        for (let j = 0; j < dates.length; j++) {
          datesStr += dates[j] + '\n'
        }

        this.chartPoint.push({
          "latitude": coords.lat,
          "longitude": coords.lng,
          "title": city + '\n' + datesStr,
          "color": '#05C95B'
        })
      }
      this.printChart()
    },

    printChart: function () {
      // Themes begin
      am4core.useTheme(am4themes_dark);
      am4core.useTheme(am4themes_animated);
      // Themes end

      // Create map instance
      var chart = am4core.create("chartdiv", am4maps.MapChart);
      chart.geodata = am4geodata_continentsLow;
      chart.projection = new am4maps.projections.Miller();

      // Colors
      var color1 = chart.colors.getIndex(0);

      chart.homeGeoPoint = {
        latitude: 35,
        longitude: 0
      }
      chart.homeZoomLevel = 0.75;
      chart.minZoomLevel = 0.75;

      // Create map polygon series
      var polygonSeries = chart.series.push(new am4maps.MapPolygonSeries());
      polygonSeries.exclude = ["antarctica"];
      polygonSeries.useGeodata = true;

      // Configure series
      var polygonTemplate = polygonSeries.mapPolygons.template;
      polygonTemplate.fill = am4core.color("#f8f8f8");

      // Add shadow
      var shadow = polygonSeries.filters.push(new am4core.DropShadowFilter());
      shadow.color = am4core.color("#60666b");
      shadow.blur = 0;

      // Create hover state and set alternative fill color
      var hs = polygonTemplate.states.create("hover");
      hs.properties.fill = chart.colors.getIndex(0);

      // Add image series
      var imageSeries = chart.series.push(new am4maps.MapImageSeries());
      imageSeries.mapImages.template.propertyFields.longitude = "longitude";
      imageSeries.mapImages.template.propertyFields.latitude = "latitude";
      imageSeries.mapImages.template.tooltipText = "{title}";
      imageSeries.mapImages.template.propertyFields.url = "url";

      var circle = imageSeries.mapImages.template.createChild(am4core.Circle);
      circle.radius = 0.3;
      circle.propertyFields.fill = "color";


      var circle2 = imageSeries.mapImages.template.createChild(am4core.Circle);
      circle2.radius = 0.3;
      circle2.propertyFields.fill = "color";
      circle2.hoverable = false
      circle2.events.on("inited", function (event) {
        animateBullet(event.target);
      })


      function animateBullet(circle) {
        var animation = circle.animate([{
          property: "scale",
          from: 1,
          to: 1.3
        }, {
          property: "opacity",
          from: 1,
          to: 0
        }], 1000, am4core.ease.circleOut);
        animation.hoverable = false
        animation.events.on("animationended", function (event) {
          animateBullet(event.target.object);
        })
      }

      imageSeries.data = this.chartPoint

      document.getElementById('chartdiv').style.display = "block"
      document.querySelector('.lds-ring').style.display = "none"
    }
  }
})