package main

import (
	"log"

	"github.com/Sensetif/sensetif-app-plugin/pkg/client"
)

var hosts = []string{"localhost"}

func main() {
	cli := client.CassandraClient{}
	cli.InitializeCassandra(hosts)

	got, err := cli.FindAllScripts(1)
	if err != nil {
		log.Fatalf("Listing all scripts: %v", err)
	}

	log.Printf("Got: %v", got)
}
