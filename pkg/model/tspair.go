package model

import "time"

type TsPair struct {
	TS    time.Time `json:"ts"`
	Value float64   `json:"value"`
}

func (t TsPair) cmp(other TsPair) int {
	if t.TS.Before(other.TS) {
		return -1
	} else if t.TS.After(other.TS) {
		return 1
	}
	return 0
}
