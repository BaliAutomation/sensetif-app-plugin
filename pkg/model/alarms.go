package model

import "time"

type AlarmState struct {
	TS    time.Time `json:"ts"`
	Value float64   `json:"value"`
}
