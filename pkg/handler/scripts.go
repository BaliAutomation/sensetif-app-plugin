package handler

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/Sensetif/sensetif-app-plugin/pkg/client"
	"github.com/Sensetif/sensetif-app-plugin/pkg/model"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/backend/log"
)

func ListScripts(orgId int64, _ ResourceRequest, clients *client.Clients) (*backend.CallResourceResponse, error) {
	log.DefaultLogger.Info("ListScripts()")
	scripts, err := clients.Cassandra.FindAllScripts(orgId)
	if err != nil {
		log.DefaultLogger.Error("Unable to read scripts.")
		return nil, fmt.Errorf("%w: %s", model.ErrUnprocessableEntity, err.Error())
	}
	rawJson, err := json.Marshal(scripts)
	if err != nil {
		log.DefaultLogger.Error("Unable to marshal json")
		return nil, fmt.Errorf("%w: %s", model.ErrUnprocessableEntity, err.Error())
	}
	return &backend.CallResourceResponse{
		Status: http.StatusOK,
		Body:   rawJson,
	}, nil
}

func UpdateScript(orgId int64, req ResourceRequest, clients *client.Clients) (*backend.CallResourceResponse, error) {
	backend.Logger.With("org_id", orgId).With("req", req).Debug("UpdateScript()")

	key := fmt.Sprintf("1:%d:updateScript", orgId)
	clients.Pulsar.Send(model.ConfigurationTopic, key, req.Body)

	return &backend.CallResourceResponse{
		Status: http.StatusAccepted,
	}, nil
}
