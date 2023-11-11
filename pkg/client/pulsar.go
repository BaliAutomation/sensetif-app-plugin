package client

import (
	"context"
	"time"

	"github.com/Sensetif/sensetif-app-plugin/pkg/model"
	"github.com/apache/pulsar-client-go/pulsar"
	"github.com/grafana/grafana-plugin-sdk-go/backend/log"
)

type PulsarClient struct {
	client    pulsar.Client
	producers map[string]pulsar.Producer
}

func (p *PulsarClient) Partitions(topic string) []string {
	topic = model.MainNamespace + "/" + topic
	parts, _ := p.client.TopicPartitions(topic)
	return parts
}

func (p *PulsarClient) CreateReader(topic string, earliest bool) pulsar.Reader {
	var start pulsar.MessageID
	if earliest {
		start = pulsar.EarliestMessageID()
	} else {
		start = pulsar.LatestMessageID()
	}
	reader, err := p.client.CreateReader(pulsar.ReaderOptions{
		Topic:          topic,
		StartMessageID: start,
	})
	if err != nil {
		log.DefaultLogger.With("error", err).With("topic", topic).Error("Failed to create Pulsar Reader")
	}
	return reader
}

func (p *PulsarClient) Send(topic string, key string, value []byte) pulsar.MessageID {
	logger := log.DefaultLogger.
		With("topic", topic).
		With("key", key).
		With("value", value)

	topic = model.MainNamespace + "/" + topic
	parts, e := p.client.TopicPartitions(topic)
	if e != nil {
		logger.With("error", e).Error("Failed to create a producer")
		return nil
	} else {
		logger.With("parts", parts).Info("Topic partitions")
	}
	producer := p.getOrCreateProducer(topic)
	if producer == nil {
		return nil
	}
	message := &pulsar.ProducerMessage{
		Payload: value,
		Key:     key,
	}

	msgId, err := producer.Send(context.Background(), message)
	if err != nil {
		logger.Error("Failed to send a message")
	} else {
		logger.Info("Sent message")
	}

	return msgId
}

func (p *PulsarClient) getOrCreateProducer(topic string) pulsar.Producer {
	producer := p.producers[topic]
	if producer == nil {
		var err error
		options := pulsar.ProducerOptions{
			Topic:           topic,
			DisableBatching: true,
		}
		producer, err = p.client.CreateProducer(options)
		if err != nil {
			log.DefaultLogger.With("error", err).With("topic", topic).Error("Failed to create a producer")
			return nil
		} else {
			log.DefaultLogger.With("topic", topic).Info("Created a new producer")
		}
		p.producers[topic] = producer
	}
	return producer
}

func (p *PulsarClient) InitializePulsar(pulsarHosts string, clientId string) {
	p.producers = make(map[string]pulsar.Producer)
	var err error
	p.client, err = pulsar.NewClient(pulsar.ClientOptions{
		URL:               pulsarHosts,
		ConnectionTimeout: 30 * time.Second,
		OperationTimeout:  30 * time.Second,
	})
	if err != nil {
		log.DefaultLogger.Error("Failed to initialize Pulsar: " + err.Error())
		return
	} else {
		log.DefaultLogger.With("clientId", clientId).With("hosts", pulsarHosts).Info("Connecting to Pulsar")
	}
	defer p.client.Close()
}

func (p *PulsarClient) Subscribe(options pulsar.ConsumerOptions) (*pulsar.Consumer, error) {
	consumer, err := p.client.Subscribe(options)
	return &consumer, err
}
