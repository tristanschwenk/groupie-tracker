package main

import (
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"strings"
)

func main() {
	//Deliver content of static directory on web pages
	fileServer := http.FileServer(http.Dir("./public"))
	http.Handle("/", fileServer)
	http.HandleFunc("/api/", getAPI)
	http.HandleFunc("/deezer/", getDEEZER)

	//Text to print when starting server
	fmt.Println("Starting server at port 8080")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatal(err)
	}
}

func getAPI(w http.ResponseWriter, r *http.Request) {
	params := r.URL.Path[4:]
	fmt.Println(params)
	if params == "/" {
		params = ""
	}

	fmt.Println("API Request...")

	resp, err := http.Get("https://groupietrackers.herokuapp.com/api" + params)
	if err != nil {
		log.Println(err)
	}

	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Println(err)
	}

	fmt.Println("Data received")

	w.Write(body)
}

func getDEEZER(w http.ResponseWriter, r *http.Request) {

	params := strings.TrimPrefix(r.RequestURI, "/deezer/")

	fmt.Println("Deezer Request...")

	resp, err := http.Get("https://api.deezer.com/" + params)
	if err != nil {
		log.Println(err)
	}

	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Println(err)
	}

	w.Write(body)
}
