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

func ListDatapoints(orgId int64, req ResourceRequest, clients *client.Clients) (*backend.CallResourceResponse, error) {
	if len(req.Params) < 3 {
		return nil, fmt.Errorf("%w: missing params: \"%v\"", model.ErrBadRequest, req.Params)
	}
	datapoints, err := clients.Cassandra.FindAllDatapoints(orgId, req.Params[1], req.Params[2])
	if err != nil {
		log.DefaultLogger.Error("Unable read datapoint.")
		return nil, fmt.Errorf("%w: %s", model.ErrUnprocessableEntity, err.Error())
	}
	rawJson, err := json.Marshal(datapoints)
	if err != nil {
		log.DefaultLogger.Error("Unable to marshal json")
		return nil, fmt.Errorf("%w: %s", model.ErrUnprocessableEntity, err.Error())
	}
	return &backend.CallResourceResponse{
		Status: http.StatusOK,
		Body:   rawJson,
	}, nil
}

func GetDatapoint(orgId int64, req ResourceRequest, clients *client.Clients) (*backend.CallResourceResponse, error) {
	if len(req.Params) < 4 {
		return nil, fmt.Errorf("%w: missing params: \"%v\"", model.ErrBadRequest, req.Params)
	}
	datapoint, err := clients.Cassandra.GetDatapoint(orgId, req.Params[1], req.Params[2], req.Params[3])
	if err != nil {
		return nil, fmt.Errorf("%w: %s", model.ErrUnprocessableEntity, err.Error())
	}
	bytes, err := json.Marshal(datapoint)
	if err != nil {
		return nil, fmt.Errorf("%w: %s", model.ErrUnprocessableEntity, err.Error())
	}
	return &backend.CallResourceResponse{
		Status:  http.StatusOK,
		Headers: make(map[string][]string),
		Body:    bytes,
	}, nil
}

func UpdateDatapoint(orgId int64, req ResourceRequest, clients *client.Clients) (*backend.CallResourceResponse, error) {
	key := "2:" + strconv.FormatInt(orgId, 10) + ":updateDatapoint"
	clients.Pulsar.Send(model.ConfigurationTopic, key, req.Body)
	return &backend.CallResourceResponse{
		Status: http.StatusAccepted,
	}, nil
}

func DeleteDatapoint(orgId int64, req ResourceRequest, clients *client.Clients) (*backend.CallResourceResponse, error) {
	if len(req.Params) < 4 {
		return nil, fmt.Errorf("%w: missing params: \"%v\"", model.ErrBadRequest, req.Params)
	}
	datapoint := model.DatapointIdentifier{
		OrgId:     orgId,
		Project:   req.Params[1],
		Subsystem: req.Params[2],
		Datapoint: req.Params[3],
	}
	bytes, err := json.Marshal(datapoint)
	if err == nil {
		key := "2:" + strconv.FormatInt(orgId, 10) + ":deleteDatapoint"
		clients.Pulsar.Send(model.ConfigurationTopic, key, bytes)
		return &backend.CallResourceResponse{
			Status: http.StatusAccepted,
		}, nil
	}
	return nil, err
}

func RenameDatapoint(orgId int64, req ResourceRequest, clients *client.Clients) (*backend.CallResourceResponse, error) {
	key := "2:" + strconv.FormatInt(orgId, 10) + ":renameDatapoint"
	clients.Pulsar.Send(model.ConfigurationTopic, key, req.Body)
	return &backend.CallResourceResponse{
		Status: http.StatusAccepted,
	}, nil
}
