package client

import (
	"context"
	"fmt"
	"math"
	"strconv"
	"time"

	"github.com/Sensetif/sensetif-app-plugin/pkg/model"
	"github.com/gocql/gocql"
	"github.com/grafana/grafana-plugin-sdk-go/backend/log"
)

type Cassandra interface {
	QueryTimeseries(org int64, sensor model.QueryRef, from time.Time, to time.Time, maxValue int) []model.TsPair
	QueryAlarmHistory(org int64, sensor model.QueryRef, from time.Time, to time.Time, maxValue int) ([]model.TsPair, error)
	QueryAlarmStates(org int64, sensor model.QueryRef) ([]model.TsPair, error)
	FindAllProjects(org int64) ([]model.ProjectSettings, error)
	FindAllSubsystems(org int64, projectName string) ([]model.SubsystemSettings, error)
	FindAllDatapoints(org int64, projectName string, subsystemName string) ([]model.DatapointSettings, error)
	GetOrganization(orgId int64) (model.OrganizationSettings, error)
	GetProject(orgId int64, name string) (model.ProjectSettings, error)
	GetSubsystem(org int64, projectName string, subsystem string) (model.SubsystemSettings, error)
	GetDatapoint(org int64, projectName string, subsystemName string, datapoint string) (model.DatapointSettings, error)

	Shutdown()
	Reinitialize()
	Err() error
	IsHealthy() bool
}

type CassandraClient struct {
	clusterConfig *gocql.ClusterConfig
	session       *gocql.Session
	err           error
	ctx           context.Context
}

func (cass *CassandraClient) InitializeCassandra(hosts []string) {
	log.DefaultLogger.Info("Initialize Cassandra client: " + hosts[0])
	cass.clusterConfig = gocql.NewCluster()
	cass.clusterConfig.Keyspace = "ks_sensetif"
	cass.clusterConfig.Hosts = hosts
	cass.clusterConfig.Port = 9042
	cass.clusterConfig.HostFilter = gocql.HostFilterFunc(func(host *gocql.HostInfo) bool {
		log.DefaultLogger.Info("Filter: " + host.ConnectAddress().String() + ":" + strconv.Itoa(host.Port()) + " --> " + host.String())
		return true
	})
	cass.Reinitialize()
}

func (cass *CassandraClient) IsHealthy() bool {
	return !cass.session.Closed()
}

func (cass *CassandraClient) Reinitialize() {
	log.DefaultLogger.Info("Re-initialize Cassandra session: " + fmt.Sprintf("%+v", cass.session) + "," + fmt.Sprintf("%+v", cass.clusterConfig))
	if cass.session != nil {
		cass.session.Close()
	}
	cass.session, cass.err = cass.clusterConfig.CreateSession()
	if cass.err != nil {
		log.DefaultLogger.Error("Unable to create Cassandra session: " + fmt.Sprintf("%+v", cass.err))
	}
	cass.ctx = context.Background()
	log.DefaultLogger.Info("Cassandra session: " + fmt.Sprintf("%+v", cass.session))
}

func (cass *CassandraClient) QueryTimeseries(org int64, query model.QueryRef, from time.Time, to time.Time, maxValues int) []model.TsPair {
	// log.DefaultLogger.Info("queryTimeseries:  " + strconv.FormatInt(org, 10) + "/" + query.Project + "/" + query.Subsystem + "/" + query.Datapoint + "   " + from.Format(time.RFC3339) + "->" + to.Format(time.RFC3339))
	var result []model.TsPair
	startYearMonth := from.Year()*12 + int(from.Month()) - 1
	endYearMonth := to.Year()*12 + int(to.Month()) - 1
	// log.DefaultLogger.Info(fmt.Sprintf("yearMonths:  start=%d, end=%d", startYearMonth, endYearMonth))

	for yearmonth := endYearMonth; yearmonth >= startYearMonth; yearmonth-- {
		iter := cass.createQuery(timeseriesTablename, tsQuery, org, query.Project, query.Subsystem, yearmonth, query.Datapoint, from, to)
		scanner := iter.Scanner()
		for scanner.Next() {
			var rowValue model.TsPair
			err := scanner.Scan(&rowValue.Value, &rowValue.TS)
			if err != nil {
				log.DefaultLogger.Error("Internal Error 1? Failed to read record", err)
			}
			p := []model.TsPair{rowValue}
			result = append(p, result...)
		}
		err := iter.Close()
		if err != nil {
			log.DefaultLogger.Error("Internal Error 2? Failed to read record", err)
		}
	}
	return reduceSize(maxValues, result, query.Aggregation)
}

// func (cass *CassandraClient) QueryAlarmHistory(org int64, sensor model.QueryRef, from time.Time, to time.Time, maxValues int) []model.TsPair {
func (cass *CassandraClient) QueryAlarmHistory(_ int64, _ model.QueryRef, _ time.Time, _ time.Time, _ int) ([]model.TsPair, error) {
	return make([]model.TsPair, 0), nil
}

// func (cass *CassandraClient) QueryAlarmStates(org int64, sensor model.QueryRef) []model.TsPair {
func (cass *CassandraClient) QueryAlarmStates(_ int64, _ model.QueryRef) ([]model.TsPair, error) {
	return make([]model.TsPair, 0), nil
}

func (cass *CassandraClient) GetCurrentLimits(orgId int64) (model.PlanLimits, error) {
	// log.DefaultLogger.Info("GetCurrentLimits for " + strconv.FormatInt(orgId, 10))
	iter := cass.createQuery(planlimitsTablename, planlimitsQuery, orgId)
	scanner := iter.Scanner()
	var limits model.PlanLimits
	limits.MaxStorage = "b"
	limits.MaxDatapoints = 50
	limits.MinPollInterval = "one_hour"
	for scanner.Next() {
		err := scanner.Scan(&limits.MaxDatapoints, &limits.MaxStorage, &limits.MinPollInterval)
		if err != nil {
			log.DefaultLogger.Error("Internal Error 3? Failed to read record", err)
		}
	}
	return limits, iter.Close()
}

func (cass *CassandraClient) GetOrganization(orgId int64) (model.OrganizationSettings, error) {
	log.DefaultLogger.Info("getOrganization:  " + strconv.FormatInt(orgId, 10))
	// SELECT name,email,stripecustomer,currentplan,address1,address2,zipcode,city,state,country FROM %s.%s WHERE orgid = ? AND DELETED = '1970-01-01 0:00:00+0000';"
	iter := cass.createQuery(organizationsTablename, organizationQuery, orgId)
	scanner := iter.Scanner()
	for scanner.Next() {
		var org model.OrganizationSettings
		err := scanner.Scan(&org.Name, &org.Email, &org.StripeCustomer, &org.CurrentPlan)
		if err != nil {
			log.DefaultLogger.Error("Internal Error 4? Failed to read record", err)
		}
		return org, iter.Close()
	}
	return model.OrganizationSettings{}, iter.Close()
}

func (cass *CassandraClient) GetProject(orgId int64, name string) (model.ProjectSettings, error) {
	log.DefaultLogger.Info("getProject:  " + strconv.FormatInt(orgId, 10) + "/" + name)
	iter := cass.createQuery(projectsTablename, projectQuery, orgId, name)
	scanner := iter.Scanner()
	for scanner.Next() {
		var rowValue model.ProjectSettings
		err := scanner.Scan(&rowValue.Name, &rowValue.Title, &rowValue.City, &rowValue.Country, &rowValue.Timezone, &rowValue.Geolocation)
		if err != nil {
			log.DefaultLogger.Error("Internal Error 5? Failed to read record", err)
		}
		return rowValue, iter.Close()
	}
	return model.ProjectSettings{}, iter.Close()
}

func (cass *CassandraClient) FindAllProjects(org int64) ([]model.ProjectSettings, error) {
	log.DefaultLogger.Info("findAllProjects:  " + strconv.FormatInt(org, 10))
	result := make([]model.ProjectSettings, 0)
	iter := cass.createQuery(projectsTablename, projectsQuery, org)
	scanner := iter.Scanner()
	for scanner.Next() {
		var rowValue model.ProjectSettings
		err := scanner.Scan(&rowValue.Name, &rowValue.Title, &rowValue.City, &rowValue.Country, &rowValue.Timezone, &rowValue.Geolocation)
		if err != nil {
			log.DefaultLogger.Error("Internal Error 6? Failed to read record", err)
		}
		result = append(result, rowValue)
	}
	log.DefaultLogger.Info(fmt.Sprintf("Found: %d projects", len(result)))
	return result, iter.Close()
}

func (cass *CassandraClient) GetSubsystem(org int64, projectName string, subsystem string) (model.SubsystemSettings, error) {
	log.DefaultLogger.Info("getSubsystem:  " + strconv.FormatInt(org, 10) + "/" + projectName + "/" + subsystem)
	iter := cass.createQuery(subsystemsTablename, subsystemQuery, org, projectName, subsystem)
	scanner := iter.Scanner()
	for scanner.Next() {
		var rowValue model.SubsystemSettings
		rowValue.Project = projectName
		err := scanner.Scan(&rowValue.Name, &rowValue.Title, &rowValue.Locallocation)
		if err != nil {
			log.DefaultLogger.Error("Internal Error 7? Failed to read record", err)
		}
		return rowValue, iter.Close()
	}
	return model.SubsystemSettings{}, iter.Close()
}

func (cass *CassandraClient) FindAllSubsystems(org int64, projectName string) ([]model.SubsystemSettings, error) {
	log.DefaultLogger.Info("findAllSubsystems:  " + strconv.FormatInt(org, 10) + "/" + projectName)
	result := make([]model.SubsystemSettings, 0)
	iter := cass.createQuery(subsystemsTablename, subsystemsQuery, org, projectName)
	scanner := iter.Scanner()
	for scanner.Next() {
		var rowValue model.SubsystemSettings
		rowValue.Project = projectName
		err := scanner.Scan(&rowValue.Name, &rowValue.Title, &rowValue.Locallocation)
		if err != nil {
			log.DefaultLogger.Error("Internal Error 8? Failed to read record", err)
		}
		result = append(result, rowValue)
	}
	log.DefaultLogger.Info(fmt.Sprintf("Found: %d subsystems", len(result)))
	return result, iter.Close()
}

func (cass *CassandraClient) GetDatapoint(org int64, projectName string, subsystemName string, datapoint string) (model.DatapointSettings, error) {
	log.DefaultLogger.Info("getDatapoint:  " + strconv.FormatInt(org, 10) + "/" + projectName + "/" + datapoint)
	iter := cass.createQuery(datapointsTablename, datapointQuery, org, projectName, subsystemName, datapoint)
	scanner := iter.Scanner()
	for scanner.Next() {
		return cass.deserializeDatapointRow(scanner), iter.Close()
	}
	return model.DatapointSettings{}, iter.Close()
}

func (cass *CassandraClient) FindAllDatapoints(org int64, projectName string, subsystemName string) ([]model.DatapointSettings, error) {
	log.DefaultLogger.Info("findAllDatapoints:  " + strconv.FormatInt(org, 10) + "/" + projectName + "/" + subsystemName)
	result := make([]model.DatapointSettings, 0)
	iter := cass.createQuery(datapointsTablename, datapointsQuery, org, projectName, subsystemName)
	log.DefaultLogger.Info("1")
	scanner := iter.Scanner()
	for scanner.Next() {
		log.DefaultLogger.Info("2")
		datapoint := cass.deserializeDatapointRow(scanner)
		log.DefaultLogger.Info("3")
		result = append(result, datapoint)
		log.DefaultLogger.Info("4")
	}
	log.DefaultLogger.Info(fmt.Sprintf("Found: %d datapoints", len(result)))
	return result, iter.Close()
}

func (cass *CassandraClient) SelectAllInJournal(org int64, journaltype string, journalname string) (model.Journal, error) {
	log.DefaultLogger.Info("SelectAllInJournal:  " + strconv.FormatInt(org, 10) + "/" + journaltype + "/" + journalname)
	result := model.Journal{
		Type: journaltype,
		Name: journalname,
	}
	iter := cass.createQuery(journalTablename, journalSelectAllQuery, org, journaltype, journalname)
	scanner := iter.Scanner()
	for scanner.Next() {
		entry := model.JournalEntry{}
		err := scanner.Scan(&entry.Value, &entry.Added)
		if err != nil {
			log.DefaultLogger.Error(fmt.Sprintf("Unable to read Cassandra row(s) for %s (%s)", journalname, journaltype))
			return model.Journal{}, err
		}
		result.Entries = append(result.Entries, entry)
	}
	return result, iter.Close()
}

func (cass *CassandraClient) SelectRangeInJournal(org int64, journaltype string, journalname string, from time.Time, to time.Time) (model.Journal, error) {
	log.DefaultLogger.Info("SelectAllInJournal:  " + strconv.FormatInt(org, 10) + "/" + journaltype + "/" + journalname)
	result := model.Journal{
		Type: journaltype,
		Name: journalname,
	}
	iter := cass.createQuery(journalTablename, journalSelectRangeQuery, org, journaltype, journalname, from, to)
	scanner := iter.Scanner()
	for scanner.Next() {
		entry := model.JournalEntry{}
		err := scanner.Scan(&entry.Value, &entry.Added)
		if err != nil {
			log.DefaultLogger.Error(fmt.Sprintf("Unable to read Cassandra row(s) for %s (%s)", journalname, journaltype))
			return model.Journal{}, err
		}
		result.Entries = append(result.Entries, entry)
	}
	return result, iter.Close()
}

func (cass *CassandraClient) Shutdown() {
	log.DefaultLogger.Info("Shutdown Cassandra client")
	cass.session.Close()
}

func (cass *CassandraClient) Err() error {
	return cass.err
}

func (cass *CassandraClient) createQuery(tableName string, query string, args ...interface{}) *gocql.Iter {
	t := fmt.Sprintf(query, cass.clusterConfig.Keyspace, tableName)
	q := cass.session.Query(t).Consistency(gocql.One).Idempotent(true).Bind(args...)
	//	log.DefaultLogger.Info("query:  " + q.String())
	return q.Iter()
}

func (cass *CassandraClient) deserializeDatapointRow(scanner gocql.Scanner) model.DatapointSettings {
	var r model.DatapointSettings
	// project,subsystem,name,pollinterval,datasourcetype,timetolive,proc,ttnv3,web,mqtt,parameters
	var ttnv3 model.Ttnv3Datasource
	var web model.WebDatasource
	var mqtt model.MqttDatasource
	var parameters map[string]string
	var proc model.Processing
	err := scanner.Scan(&r.Project, &r.Subsystem, &r.Name, &r.Interval, &r.SourceType, &r.TimeToLive, &proc, &ttnv3, &web, &mqtt, &parameters)
	log.DefaultLogger.Info(fmt.Sprintf("Datapoint: %+v", r))
	log.DefaultLogger.Info(fmt.Sprintf("Processing: %+v", proc))
	r.Proc = proc
	if err == nil {
		switch r.SourceType {
		case model.Web:
			r.Datasource = web
		case model.Ttnv3:
			r.Datasource = ttnv3
		case model.Mqtt:
			r.Datasource = mqtt
		case model.Parameters:
			var pds model.ParametersDatasource
			pds.Parameters = parameters
			r.Datasource = pds
		}
	}
	if err != nil {
		log.DefaultLogger.Error(fmt.Sprintf("Internal Error 9? Failed to read record: %s, %+v", err.Error(), err))
	}
	return r
}

func reduceSize(maxValues int, data []model.TsPair, aggregation string) []model.TsPair {
	resultLength := len(data)
	log.DefaultLogger.Info(fmt.Sprintf("Reducing datapoints from %d to %d", resultLength, maxValues))
	var factor int
	factor = resultLength/maxValues + 1
	newSize := resultLength / factor
	var downsized = make([]model.TsPair, newSize, newSize)
	start := resultLength
	for i := newSize - 1; i >= 0; i = i - 1 {
		end := start - 1
		start = start - factor
		switch aggregation {
		case "":
			downsized[i] = downsizeBySample(data, start, end)
		case "delta":
			if start > 0 {
				downsized[i] = downsizeByDelta(data, start-1, end)
			}
		case "min":
			downsized[i] = downsizeByMin(data, start, end)
		case "max":
			downsized[i] = downsizeByMax(data, start, end)
		case "sum":
			downsized[i] = downsizeBySum(data, start, end)
		case "average":
			downsized[i] = downsizeByAverage(data, start, end)
		}
	}
	//log.DefaultLogger.Info(fmt.Sprintf("Reduced to %d", len(downsized)))
	return downsized
}

func downsizeBySum(data []model.TsPair, start int, end int) model.TsPair {
	var sum float64 = 0
	for i := start; i < end; i++ {
		sum = sum + data[i].Value
	}
	var result model.TsPair
	result.TS = data[end-1].TS
	result.Value = sum
	return result
}

func downsizeByDelta(data []model.TsPair, start int, end int) model.TsPair {
	var result model.TsPair
	result.TS = data[end-1].TS
	result.Value = data[end-1].Value - data[start].Value
	return result
}

func downsizeByMin(data []model.TsPair, start int, end int) model.TsPair {
	min := math.MaxFloat64
	for i := start; i < end; i++ {
		min = math.Min(min, data[i].Value)
	}
	var result model.TsPair
	result.TS = data[end-1].TS
	result.Value = min
	return result
}

func downsizeByMax(data []model.TsPair, start int, end int) model.TsPair {
	max := -math.MaxFloat64
	for i := start; i < end; i++ {
		max = math.Max(max, data[i].Value)
	}
	var result model.TsPair
	result.TS = data[end-1].TS
	result.Value = max
	return result
}

func downsizeByAverage(data []model.TsPair, start int, end int) model.TsPair {
	var sum float64 = 0
	for i := start; i < end; i++ {
		sum = sum + data[i].Value
	}
	var result model.TsPair
	result.TS = data[end-1].TS
	result.Value = sum / float64(end-start)
	return result
}

func downsizeBySample(data []model.TsPair, start int, end int) model.TsPair {
	return data[end-1]
}

const projectsTablename = "projects"

const projectQuery = "SELECT name,title,city,country,timezone,geolocation FROM %s.%s WHERE orgid = ? AND name = ? AND DELETED = '1970-01-01 0:00:00+0000' ALLOW FILTERING;"

const organizationsTablename = "organizations"

const organizationQuery = "SELECT name,email,stripecustomer,currentplan,address1,address2,zipcode,city,state,country FROM %s.%s WHERE orgid = ? AND DELETED = '1970-01-01 0:00:00+0000'  ALLOW FILTERING;"

const projectsQuery = "SELECT name,title,city,country,timezone,geolocation FROM %s.%s WHERE orgid = ? AND DELETED = '1970-01-01 0:00:00+0000' ALLOW FILTERING;"

const subsystemsTablename = "subsystems"

const subsystemQuery = "SELECT name,title,location FROM %s.%s WHERE orgid = ? AND project = ? AND name = ? AND DELETED = '1970-01-01 0:00:00+0000' ALLOW FILTERING;"

const subsystemsQuery = "SELECT name,title,location FROM %s.%s WHERE orgid = ? AND project = ? AND DELETED = '1970-01-01 0:00:00+0000' ALLOW FILTERING;"

const datapointsTablename = "datapoints"

const datapointQuery = "SELECT project,subsystem,name,pollinterval,datasourcetype,timetolive,proc,ttnv3,web,mqtt,parameters FROM %s.%s WHERE orgid = ? AND project = ? AND subsystem = ? AND name = ? AND DELETED = '1970-01-01 0:00:00+0000' ALLOW FILTERING;"

const datapointsQuery = "SELECT project,subsystem,name,pollinterval,datasourcetype,timetolive,proc,ttnv3,web,mqtt,parameters FROM %s.%s WHERE orgid = ? AND project = ? AND subsystem = ? AND DELETED = '1970-01-01 0:00:00+0000' ALLOW FILTERING;"

const planlimitsQuery = "SELECT orgid,created,maxdatapoints,maxstorage,minpollinterval FROM  %s.%s WHERE orgid = 5 AND deleted = '1970-01-01 00:00:00.000000+0000' ALLOW FILTERING;"

const planlimitsTablename = "planlimits"

const timeseriesTablename = "timeseries"

const alarmsTablename = "alarms"

const tsQuery = "SELECT value,ts FROM %s.%s" +
	" WHERE" +
	" orgId = ?" +
	" AND" +
	" project = ?" +
	" AND" +
	" subsystem = ?" +
	" AND" +
	" yearmonth = ?" +
	" AND" +
	" datapoint = ?" +
	" AND " +
	"ts >= ?" +
	" AND " +
	" ts <= ?" +
	";"

// const keyValuesTablename = "keyvalues"
// const keyValuesSelectQuery = "SELECT type, key, created, value FROM %s.%s WHERE orgid = ? AND type = ? AND key = '___ALL___' AND deleted = '1970-01-01 0:00:00+0000';\n"
const (
	journalTablename        = "journals"
	journalSelectAllQuery   = "SELECT value,ts FROM %s.%s WHERE orgid = ? AND type = ? AND name = ?;"
	journalSelectRangeQuery = "SELECT value,ts FROM %s.%s WHERE orgid = ? AND type = ? AND name = ? AND ts >= ? AND  ts <= ? ;"
)