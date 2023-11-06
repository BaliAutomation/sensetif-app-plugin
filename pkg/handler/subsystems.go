package handler

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"github.com/Sensetif/sensetif-app-plugin/pkg/client"
	"github.com/Sensetif/sensetif-app-plugin/pkg/model"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/backend/log"
)

func ListSubsystems(orgId int64, req ResourceRequest, clients *client.Clients) (*backend.CallResourceResponse, error) {
	if len(req.Params) < 2 {
		return nil, fmt.Errorf("%w: missing req.Params: \"%v\"", model.ErrBadRequest, req.Params)
	}

	subsystems, err := clients.Cassandra.FindAllSubsystems(orgId, req.Params[1])
	if err != nil {
		log.DefaultLogger.Error("Unable to read subsystems")
		return nil, fmt.Errorf("%w: %s", model.ErrUnprocessableEntity, err.Error())
	}
	rawJson, err := json.Marshal(subsystems)
	if err != nil {
		log.DefaultLogger.Error("Unable to marshal json")
		return nil, fmt.Errorf("%w: %s", model.ErrUnprocessableEntity, err.Error())
	}

	return &backend.CallResourceResponse{
		Status: http.StatusOK,
		Body:   rawJson,
	}, nil
}

func GetSubsystem(orgId int64, req ResourceRequest, clients *client.Clients) (*backend.CallResourceResponse, error) {
	if len(req.Params) < 3 {
		return nil, fmt.Errorf("%w: missing req.Params: \"%v\"", model.ErrBadRequest, req.Params)
	}

	subsystem, err := clients.Cassandra.GetSubsystem(orgId, req.Params[1], req.Params[2])
	if err != nil {
		return nil, fmt.Errorf("%w: %s", model.ErrUnprocessableEntity, err.Error())
	}
	bytes, err := json.Marshal(subsystem)
	if err != nil {
		return nil, fmt.Errorf("%w: %s", model.ErrUnprocessableEntity, err.Error())
	}
	return &backend.CallResourceResponse{
		Status:  http.StatusOK,
		Headers: make(map[string][]string),
		Body:    bytes,
	}, nil
}

func UpdateSubsystem(orgId int64, req ResourceRequest, clients *client.Clients) (*backend.CallResourceResponse, error) {
	key := "2:" + strconv.FormatInt(orgId, 10) + ":updateSubsystem"
	clients.Pulsar.Send(model.ConfigurationTopic, key, req.Body)
	return &backend.CallResourceResponse{
		Status: http.StatusAccepted,
	}, nil
}

func DeleteSubsystem(orgId int64, req ResourceRequest, clients *client.Clients) (*backend.CallResourceResponse, error) {
	if len(req.Params) < 3 {
		return nil, fmt.Errorf("%w: missing req.Params: \"%v\"", model.ErrBadRequest, req.Params)
	}
	key := "2:" + strconv.FormatInt(orgId, 10) + ":deleteSubsystem"
	data, err := json.Marshal(map[string]string{
		"project":   req.Params[1],
		"subsystem": req.Params[2],
	})
	if err == nil {
		clients.Pulsar.Send(model.ConfigurationTopic, key, data)
		return &backend.CallResourceResponse{
			Status: http.StatusAccepted,
		}, nil
	}
	return &backend.CallResourceResponse{
		Status: http.StatusBadRequest,
	}, nil
}

func RenameSubsystem(orgId int64, req ResourceRequest, clients *client.Clients) (*backend.CallResourceResponse, error) {
	if len(req.Params) < 3 {
		return nil, fmt.Errorf("%w: missing req.Params: \"%v\"", model.ErrBadRequest, req.Params)
	}
	key := "2:" + strconv.FormatInt(orgId, 10) + ":renameSubsystem"
	clients.Pulsar.Send(model.ConfigurationTopic, key, req.Body)
	return &backend.CallResourceResponse{
		Status: http.StatusAccepted,
	}, nil
}
