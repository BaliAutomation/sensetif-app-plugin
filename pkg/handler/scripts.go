package handler

import (
	"fmt"
	"net/http"

	"github.com/Sensetif/sensetif-app-plugin/pkg/client"
	"github.com/Sensetif/sensetif-app-plugin/pkg/model"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
)

func UpdateScript(orgId int64, req ResourceRequest, clients *client.Clients) (*backend.CallResourceResponse, error) {
	backend.Logger.With("org_id", orgId).With("req", req).Debug("UpdateScript()")

	key := fmt.Sprintf("1:%d:updateScript", orgId)
	clients.Pulsar.Send(model.ScriptsTopic, key, req.Body)

	return &backend.CallResourceResponse{
		Status: http.StatusAccepted,
	}, nil
}
