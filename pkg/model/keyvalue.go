package model

import "time"

type KeyValue struct {
	Type    string    `json:"type"`
	Key     string    `json:"key"`
	Created time.Time `json:"created"`
	Value   string    `json:"value"`
}
