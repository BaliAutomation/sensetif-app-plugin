package streaming

import (
	"context"
	"strconv"
	"time"

	"github.com/Sensetif/sensetif-app-plugin/pkg/model"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/backend/log"
)

func (h *StreamHandler) SubscribeNotificationsStream(orgId int64) (*backend.SubscribeStreamResponse, error) {
	log.DefaultLogger.Info("SubscribeNotificationsStream()")
	reader := h.pulsar.CreateReader(model.NotificationTopics+strconv.FormatInt(orgId, 10), true)
	defer reader.Close()

	threeHoursAgo := time.Now().Add(-180 * time.Minute)
	seekError := reader.SeekByTime(threeHoursAgo)
	if seekError != nil {
		log.DefaultLogger.With("error", seekError).Error("Unable to seek one hour back")
	}
	var result []byte
	var count int32 = 0
	result = append(result, '[')
	notFirst := false
	for reader.HasNext() {
		msg, err := reader.Next(context.Background())
		if err != nil {
			log.DefaultLogger.Error("Unable to read Pulsar message")
		}
		if notFirst {
			result = append(result, ',')
		}
		notFirst = true
		result = append(result, msg.Payload()...)
	}
	result = append(result, ']')
	initialData, err := backend.NewInitialData(result)
	if err == nil {
		log.DefaultLogger.Info("Sending messages", "count", count)
		return &backend.SubscribeStreamResponse{
			Status:      backend.SubscribeStreamStatusOK,
			InitialData: initialData,
		}, nil
	}
	log.DefaultLogger.With("error", err).Error("Error in creating InitialData to be sent to client")
	log.DefaultLogger.Error("Error in: \n" + string(result))
	return &backend.SubscribeStreamResponse{
		Status:      backend.SubscribeStreamStatusPermissionDenied,
		InitialData: initialData,
	}, nil
}

func (h *StreamHandler) RunNotificationsStream(ctx context.Context, sender *backend.StreamSender, orgId int64) error {
	log.DefaultLogger.Info("RunNotificationsStream()")
	reader := h.pulsar.CreateReader(model.NotificationTopics+strconv.FormatInt(orgId, 10), false)
	defer reader.Close()

	threeHoursAgo := time.Now().Add(-180 * time.Minute)
	seekError := reader.SeekByTime(threeHoursAgo)
	if seekError != nil {
		log.DefaultLogger.With("error", seekError).Error("Unable to seek one hour back")
	}

	for {
		// The provided Context is capturing the connection back to the browser, so when it is
		// Done(), then we should just exit the for loop.
		msg, err := reader.Next(ctx)
		if msg == nil {
			log.DefaultLogger.Info("Grafana sender: DONE")
			return ctx.Err()
		}
		if err != nil {
			log.DefaultLogger.With("error", err).Error("Couldn't get the message via reader.Next()")
			continue
		}
		err = sender.SendJSON(msg.Payload())
		if err != nil {
			log.DefaultLogger.With("error", err).Error("Couldn't send frame")
			return err
		}
	}
}
