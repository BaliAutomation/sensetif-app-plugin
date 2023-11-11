package main

import (
	"io/ioutil"
	"net/http"
	"strings"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/backend/log"
)

func HandleFile(path string) (*backend.CallResourceResponse, error) {
	if strings.Contains(path, "..") {
		return &backend.CallResourceResponse{
			Status:  http.StatusNotFound,
			Headers: make(map[string][]string),
			Body:    []byte("Invalid filename " + path + "."),
		}, nil
	}

	filename := "/var/lib/grafana/plugins/sensetif-datasource/" + path
	return returnFileContent(filename)
}

func returnFileContent(filename string) (*backend.CallResourceResponse, error) {
	policy, err := ioutil.ReadFile(filename)
	if err != nil {
		log.DefaultLogger.With("error", err).Error("Reading error")
		return &backend.CallResourceResponse{
			Status:  http.StatusNotFound,
			Headers: make(map[string][]string),
			Body:    []byte("Can not find file " + filename + ". " + err.Error()),
		}, nil
	}

	headers := map[string][]string{
		"Content-Type": {"text/html"},
	}
	return &backend.CallResourceResponse{
		Status:  http.StatusOK,
		Headers: headers,
		Body:    policy,
	}, nil
}
