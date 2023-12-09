package model

type KeyValuesEntry struct {
	OrgId int64  `json:"orgId"`
	Type  string `json:"type"`
	Key   string `json:"key"`
	Value string `json:"value"`
}
