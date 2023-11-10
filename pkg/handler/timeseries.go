package handler

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/Sensetif/sensetif-app-plugin/pkg/client"
	"github.com/Sensetif/sensetif-app-plugin/pkg/model"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/backend/log"
)

type TsDatapoint struct {
	Organization int64     `json:"organization"`
	Project      string    `json:"project"`
	Subsystem    string    `json:"subsystem"`
	Name         string    `json:"name"`
	Timestamp    time.Time `json:"timestamp"`
	Value        float64   `json:"value"`
}

func UpdateTimeseries(orgId int64, req ResourceRequest, clients *client.Clients) (*backend.CallResourceResponse, error) {
	key := "2:" + strconv.FormatInt(orgId, 10) + ":" + req.Params[1] + "/" + req.Params[2] + "/" + req.Params[3]
	log.DefaultLogger.Info("Timeseries update of: " + key)
	tspairs := []model.TsPair{}
	err := json.Unmarshal(req.Body, &tspairs)
	log.DefaultLogger.Info("Timeseries: " + strconv.FormatInt(int64(len(tspairs)), 10))
	if err != nil {
		log.DefaultLogger.Error("Invalid format: " + err.Error())
		return &backend.CallResourceResponse{
			Status: http.StatusBadRequest,
		}, nil
	}
	for _, tspair := range tspairs {
		message := TsDatapoint{
			Organization: orgId,
			Project:      req.Params[1],
			Subsystem:    req.Params[2],
			Name:         req.Params[3],
			Timestamp:    tspair.TS,
			Value:        tspair.Value,
		}
		msgjson, err2 := json.Marshal(message)
		if err2 == nil {
			clients.Pulsar.Send(model.TimeseriesTopic, key, msgjson)
			log.DefaultLogger.Info("Update sent for: %d:%s/%s/%s = %f", orgId, req.Params[1], req.Params[2], req.Params[3], tspair.Value)
		}
	}
	return &backend.CallResourceResponse{
		Status: http.StatusAccepted,
	}, nil
}
