package main

import (
	"context"
	"encoding/json"
	"net/http"
	. "regexp"
	"strings"

	"github.com/Sensetif/sensetif-app-plugin/pkg/client"
	"github.com/Sensetif/sensetif-app-plugin/pkg/handler"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/backend/log"
)

type ResourceHandler struct {
	Clients *client.Clients
}

type HandlerFn func(orgId int64, req handler.ResourceRequest, clients *client.Clients) (*backend.CallResourceResponse, error)

type Link struct {
	Pattern *Regexp
	Method  string
	Fn      HandlerFn
}

const (
	fileRequestRegexName = "__/"
	projectRegexName     = `[a-zA-Z][a-zA-Z0-9_.\-]*`
	subsystemRegexName   = `[a-zA-Z][a-zA-Z0-9_.\-]*`
	datapointRegexName   = `[a-zA-Z][a-zA-Z0-9_.\-$\[\]]*`
)

var links = []Link{
	// Health??
	{Method: "GET", Fn: Health, Pattern: MustCompile(`^/$`)},

	// Projects API
	{Method: "GET", Fn: handler.ListProjects, Pattern: MustCompile(`^_$`)},
	{Method: "GET", Fn: handler.GetProject, Pattern: MustCompile(`^(` + projectRegexName + `)$`)},
	{Method: "PUT", Fn: handler.UpdateProject, Pattern: MustCompile(`^(` + projectRegexName + `)$`)},
	{Method: "DELETE", Fn: handler.DeleteProject, Pattern: MustCompile(`^(` + projectRegexName + `)$`)},
	{Method: "POST", Fn: handler.RenameProject, Pattern: MustCompile(`^(` + projectRegexName + `)$`)},

	// Subsystems API
	{Method: "GET", Fn: handler.ListSubsystems, Pattern: MustCompile(`^(` + projectRegexName + `)/_$`)},
	{Method: "GET", Fn: handler.GetSubsystem, Pattern: MustCompile(`^(` + projectRegexName + `)/(` + subsystemRegexName + `)$`)},
	{Method: "PUT", Fn: handler.UpdateSubsystem, Pattern: MustCompile(`^(` + projectRegexName + `)/(` + subsystemRegexName + `)$`)},
	{Method: "DELETE", Fn: handler.DeleteSubsystem, Pattern: MustCompile(`^(` + projectRegexName + `)/(` + subsystemRegexName + `)$`)},
	{Method: "POST", Fn: handler.RenameSubsystem, Pattern: MustCompile(`^(` + projectRegexName + `)/(` + subsystemRegexName + `)$`)},

	// Datapoint API
	{Method: "GET", Fn: handler.ListDatapoints, Pattern: MustCompile(`^(` + projectRegexName + `)/(` + subsystemRegexName + `)/_$`)},
	{Method: "GET", Fn: handler.GetDatapoint, Pattern: MustCompile(`^(` + projectRegexName + `)/(` + subsystemRegexName + `)/(` + datapointRegexName + `)$`)},
	{Method: "PUT", Fn: handler.UpdateDatapoint, Pattern: MustCompile(`^(` + projectRegexName + `)/(` + subsystemRegexName + `)/(` + datapointRegexName + `)$`)},
	{Method: "DELETE", Fn: handler.DeleteDatapoint, Pattern: MustCompile(`^(` + projectRegexName + `)/(` + subsystemRegexName + `)/(` + datapointRegexName + `)$`)},
	{Method: "POST", Fn: handler.RenameDatapoint, Pattern: MustCompile(`^(` + projectRegexName + `)/(` + subsystemRegexName + `)/(` + datapointRegexName + `)$`)},

	// Import API
	{Method: "POST", Fn: handler.ImportLink2WebFvc1, Pattern: MustCompile(`^/_import/fvc1$`)},
	{Method: "POST", Fn: handler.ImportEon, Pattern: MustCompile(`^/_import/eon$`)},
	{Method: "POST", Fn: handler.ImportTtnv3App, Pattern: MustCompile(`^/_import/ttnv3$`)},

	// Limits API
	{Method: "GET", Fn: handler.CurrentLimits, Pattern: MustCompile(`^_limits/current$`)},

	// Plans API
	{Method: "GET", Fn: handler.ListPlans, Pattern: MustCompile(`^_plans$`)},
	{Method: "POST", Fn: handler.CheckOut, Pattern: MustCompile(`^_plans/checkout$`)},
	{Method: "POST", Fn: handler.CheckOutSuccess, Pattern: MustCompile(`^_checkout/success$`)},
	{Method: "POST", Fn: handler.CheckOutCancelled, Pattern: MustCompile(`^_checkout/cancelled$`)},

	// Scripts API
	{Method: "GET", Fn: handler.ListScripts, Pattern: MustCompile(`^_scripts$`)},
	{Method: "PUT", Fn: handler.UpdateScript, Pattern: MustCompile(`^_scripts$`)},

	// Organizations API
	{Method: "GET", Fn: handler.GetOrganization, Pattern: MustCompile(`^_organization$`)},

	// Timeseries Update API
	{Method: "PUT", Fn: handler.UpdateTimeseries, Pattern: MustCompile(`^_timeseries/(` + projectRegexName + `)/(` + subsystemRegexName + `)/(` + datapointRegexName + `)$`)},
}

func (p *ResourceHandler) CallResource(_ context.Context, request *backend.CallResourceRequest, sender backend.CallResourceResponseSender) error {
	orgId := request.PluginContext.OrgID
	log.DefaultLogger.With("OrgId", orgId).With("URL", request.URL).With("PATH", request.Path).With("Method", request.Method).Info("CallResource()")

	if isFileRequest(request) {
		return handleFileRequests(request, sender)
	}

	for _, link := range links {
		if link.Method == request.Method {
			parameters := link.Pattern.FindStringSubmatch(request.URL)
			if len(parameters) >= 1 {
				resourceRequest := handler.ResourceRequest{
					Params: parameters,
					Body:   request.Body,
				}

				result, err := link.Fn(orgId, resourceRequest, p.Clients)
				if err == nil {
					log.DefaultLogger.Info("CallResource Result", "result", string(result.Body))
					if result.Body == nil {
						result.Body = []byte("{}") // Maybe we always need to return a json body?
					}
					sendErr := sender.Send(result)
					if sendErr != nil {
						log.DefaultLogger.With("error", sendErr).Error("could not write response to the client")
						return sendErr
					}
					return nil
				}
			}
		}
	}
	return notFound("", sender)
}

func Health(_ int64, _ handler.ResourceRequest, _ *client.Clients) (*backend.CallResourceResponse, error) {
	return &backend.CallResourceResponse{
		Status: http.StatusOK,
		Body:   []byte{},
	}, nil
}

func isFileRequest(request *backend.CallResourceRequest) bool {
	return strings.Index(request.Path, fileRequestRegexName) == 0
}

func handleFileRequests(request *backend.CallResourceRequest, sender backend.CallResourceResponseSender) error {
	filename := strings.TrimLeft(request.Path, fileRequestRegexName)
	content, err := HandleFile(filename)
	if err != nil {
		log.DefaultLogger.Error("Could not read file: " + filename + " : " + err.Error())
		return err
	}
	err = sender.Send(content)
	if err != nil {
		log.DefaultLogger.Error("could not write content to the client. " + err.Error())
		return err
	}
	return nil
}

func notFound(message string, sender backend.CallResourceResponseSender) error {
	return sender.Send(&backend.CallResourceResponse{
		Status: http.StatusNotFound,
		Body:   createMessageJSON(message),
	})
}

func createMessageJSON(message string) []byte {
	response, _ := json.Marshal(struct {
		Message string `json:"message"`
	}{
		Message: message,
	})

	return response
}
