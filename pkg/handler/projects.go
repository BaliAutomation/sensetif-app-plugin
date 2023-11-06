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

func ListProjects(orgId int64, _ ResourceRequest, clients *client.Clients) (*backend.CallResourceResponse, error) {
	log.DefaultLogger.Info("ListProjects()")
	projects, err := clients.Cassandra.FindAllProjects(orgId)
	if err != nil {
		log.DefaultLogger.Error("Unable to read project.")
		return nil, fmt.Errorf("%w: %s", model.ErrUnprocessableEntity, err.Error())
	}
	rawJson, err := json.Marshal(projects)
	if err != nil {
		log.DefaultLogger.Error("Unable to marshal json")
		return nil, fmt.Errorf("%w: %s", model.ErrUnprocessableEntity, err.Error())
	}
	return &backend.CallResourceResponse{
		Status: http.StatusOK,
		Body:   rawJson,
	}, nil
}

func GetProject(orgId int64, req ResourceRequest, clients *client.Clients) (*backend.CallResourceResponse, error) {
	log.DefaultLogger.Info("GetProject()")
	project, err := clients.Cassandra.GetProject(orgId, req.Params[1])
	if err != nil {
		return nil, fmt.Errorf("%w: %s", model.ErrUnprocessableEntity, err.Error())
	}
	bytes, err := json.Marshal(project)
	if err != nil {
		return nil, fmt.Errorf("%w: %s", model.ErrUnprocessableEntity, err.Error())
	}
	return &backend.CallResourceResponse{
		Status: http.StatusOK,
		Body:   bytes,
	}, nil
}

func UpdateProject(orgId int64, req ResourceRequest, clients *client.Clients) (*backend.CallResourceResponse, error) {
	log.DefaultLogger.Info("UpdateProject()")
	key := "2:" + strconv.FormatInt(orgId, 10) + ":updateProject"
	log.DefaultLogger.Info(fmt.Sprintf("%+v", *clients.Pulsar))
	clients.Pulsar.Send(model.ConfigurationTopic, key, req.Body)
	return &backend.CallResourceResponse{
		Status: http.StatusAccepted,
	}, nil
}

func DeleteProject(orgId int64, req ResourceRequest, clients *client.Clients) (*backend.CallResourceResponse, error) {
	log.DefaultLogger.Info("DeleteProject()")
	if len(req.Params) < 2 {
		return nil, fmt.Errorf("%w: missing params: \"%v\"", model.ErrBadRequest, req.Params)
	}
	key := "2:" + strconv.FormatInt(orgId, 10) + ":deleteProject"
	data, err := json.Marshal(map[string]string{
		"project": req.Params[1],
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

func RenameProject(orgId int64, req ResourceRequest, clients *client.Clients) (*backend.CallResourceResponse, error) {
	log.DefaultLogger.Info("RenameProject()")
	key := "2:" + strconv.FormatInt(orgId, 10) + ":renameProject"
	clients.Pulsar.Send(model.ConfigurationTopic, key, req.Body)
	return &backend.CallResourceResponse{
		Status: http.StatusAccepted,
	}, nil
}
