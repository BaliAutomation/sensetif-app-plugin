package model

type ScriptParam struct {
	Key   string `json:"key"`
	Value string `json:"value"`
}
type Script struct {
	Name        string        `json:"name"`
	Code        string        `json:"code"`
	Language    string        `json:"language"`
	Description string        `json:"description"`
	Scope       string        `json:"scope"`
	Params      []ScriptParam `json:"params"`
}
