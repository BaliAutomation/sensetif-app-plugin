import React, { PureComponent } from 'react';
import { QueryEditorProps, SelectableValue } from '@grafana/data';
import { Select } from '@grafana/ui';

import { DataSource } from './datasource';
import { defaultQuery, SensetifDataSourceOptions, SensetifQuery } from './types';
import { defaults } from 'lodash';
import {
  aggregation,
  datapoint,
  loadDatapoints,
  loadProjects,
  loadSubsystems,
  project,
  subsystem,
  timemodel
} from './api';

type Props = QueryEditorProps<DataSource, SensetifQuery, SensetifDataSourceOptions>;

// project/subsystem/datapoint implements that
interface WithNameAndTitle {
  name: string;
  title?: string
}

interface State {
  projects: project[];
  subsystems: subsystem[];
  datapoints: datapoint[];
  aggregations: aggregation[];
  timemodels: timemodel[];
}

export class QueryEditor extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      aggregations: [
        { name: "", title: "Sample" },
        { name: "average", title: "Average" },
        { name: "min", title: "Min" },
        { name: "max", title: "Max" },
        { name: "sum", title: "Sum" },
        { name: "delta", title: "Delta" },
      ],
      timemodels: [
        { name: "", title: "None" },
        { name: "daily", title: "Daily" },
        { name: "weekly", title: "Weekly" },
        { name: "monthly", title: "Monthly" },
      ],
      datapoints: [],
      subsystems: [],
      projects: []
    };
  }

  async componentDidMount() {
    const defQuery = this.getDefaultQuery();
    const query = defaults(this.props.query, defQuery);

    await Promise.all([
      this.reloadProjects(),
      this.reloadSubsystems(query),
      this.reloadDatapoints(query),
    ])
  }

  onQueryProjectChange = async (project: project) => {
    const { onChange, query } = this.props;

    // selected the same project
    if (project.name === query.project) {
      return
    }

    onChange({ ...query, project: project.name, subsystem: '', datapoint: '' });
    if (project.name.indexOf('$') !== -1) {
      return;
    }

    try {
      const subsystems = await loadSubsystems(project.name);
      this.setState({
        subsystems: subsystems,
        datapoints: [],
      });
    } catch (e) {
      console.warn('loading subsystems after project changed', e)
    }
  };

  onQuerySubsystemChange = async (subsystem: subsystem) => {
    const { onChange, query } = this.props;

    // selected the same subsystem
    if (subsystem.name === query.subsystem) {
      return
    }

    onChange({ ...query, subsystem: subsystem.name, datapoint: '' });
    if (subsystem.name.indexOf('$') !== -1) {
      return;
    }

    try {
      const datapoints = await loadDatapoints(query.project, subsystem.name);
      this.setState({
        datapoints: datapoints,
      });
    } catch (e) {
      console.warn('loading datapoints after subsystem changed', e)
    }
  };

  onQueryDatapointChange = (datapoint: datapoint) => {
    const { onChange, query } = this.props;

    // selected the same datapoint
    if (datapoint.name === query.datapoint) {
      return
    }

    onChange({ ...query, datapoint: datapoint.name });
  };

  onQueryAggregationChange = (aggregation: aggregation) => {
    const { onChange, query } = this.props;
    if (aggregation.name === query.aggregation) {
      return
    }
    onChange({ ...query, aggregation: aggregation.name });
  };

  onQueryTimemodelChange = (timemodel: timemodel) => {
    const { onChange, query } = this.props;
    if (timemodel.name === query.timemodel) {
      return
    }
    onChange({ ...query, timemodel: timemodel.name });
  };

  onProjectOptionAdded = (value: string) => {
    const project = { name: value }
    this.setState({
      projects: [...this.state.projects, project]
    })

    this.onQueryProjectChange(project)
  }

  onSubsystemOptionAdded = (value: string) => {
    const subsystem = { name: value }
    this.setState({
      subsystems: [...this.state.subsystems, subsystem]
    })

    this.onQuerySubsystemChange(subsystem)
  }

  onDatapointOptionAdded = (value: string) => {
    const datapoint = { name: value }
    this.setState({
      datapoints: [...this.state.datapoints, datapoint]
    })

    this.onQueryDatapointChange(datapoint)
  }

  makeOption = (value: WithNameAndTitle): SelectableValue<WithNameAndTitle> => {
    return {
      label: value.title ?? value.name,
      value: value
    }
  }

  reloadProjects = async () => {
    try {
      const projects = await loadProjects();
      this.setState({ projects: projects });
    } catch (e) {
      console.warn('loading projects', e)
    }
  };

  reloadSubsystems = async (query: SensetifQuery) => {
    if (!query.project) {
      return
    }

    try {
      const subsystems = await loadSubsystems(query.project);
      this.setState({ subsystems: subsystems });
    } catch (e) {
      console.warn('loading subsystems', e)
    }
  };

  reloadDatapoints = async (query: SensetifQuery) => {
    if (!query.project || !query.subsystem) {
      return
    }

    try {
      const datapoints = await loadDatapoints(query.project, query.subsystem);
      this.setState({ datapoints: datapoints });
    } catch (e) {
      console.warn('loading datapoints', e)
    }
  };

  getDefaultQuery = (): Partial<SensetifQuery> => {
    let result = defaultQuery;

    // if some queries already exists, init based on the last configured
    if (this.props.queries && this.props.queries!.length > 1) {
      result = this.props.queries![this.props.queries!.length - 2];
    }

    return result;
  };

  render() {
    const defQuery = this.getDefaultQuery();
    const query = defaults(this.props.query, defQuery);
    const { project, subsystem, datapoint, aggregation, timemodel } = query;

    const findByName = (values: WithNameAndTitle[], name: string) => {
      let out = values.find((v) => v.name === name)
      if (out !== undefined) {
        return {
          label: out.title ?? out.name,
          value: out
        }
      }

      return {label: name, value: {name: name}}
    }

    return (
      <div className="gf-form">
        <Select<project>
          value={findByName(this.state.projects, query.project)}
          allowCustomValue
          onCreateOption={(val) => { this.onProjectOptionAdded(val) }}
          options={this.state.projects.map(this.makeOption)}
          onChange={(val) => this.onQueryProjectChange(val.value!)}
          placeholder={'The project to be queried'}
        />
        {!project.startsWith("_") && (
          <Select<subsystem>
            value={findByName(this.state.subsystems, query.subsystem)}
            allowCustomValue
            onCreateOption={(val) => { this.onSubsystemOptionAdded(val) }}
            options={this.state.subsystems.map(this.makeOption)}
            onChange={(val) => val.value?.name !== subsystem && this.onQuerySubsystemChange(val.value!)}
            placeholder={'The Subsystem within the project to be queried'}
          />
        )}
        {!project.startsWith("_") && !subsystem.startsWith("_") && (
          <Select<datapoint>
            value={findByName(this.state.datapoints, query.datapoint)}
            allowCustomValue
            onCreateOption={(val) => { this.onDatapointOptionAdded(val) }}
            options={this.state.datapoints.map(this.makeOption)}
            onChange={(val) => val.value?.name !== datapoint && this.onQueryDatapointChange(val.value!)}
            placeholder={'The Datapoint in the Subsystem'}
          />
        )}
        {!project.startsWith("_") && !subsystem.startsWith("_") && (
          <Select<aggregation>
            value={findByName(this.state.aggregations, query.aggregation)}
            options={this.state.aggregations.map(this.makeOption)}
            placeholder={'The aggregation algorithm of the values, when queried.'}
            onChange={(val) => val.value?.name !== aggregation && this.onQueryAggregationChange(val.value!)}
          />
        )}
        {!project.startsWith("_") && !subsystem.startsWith("_") && aggregation !== "" && (
          <Select<timemodel>
            value={findByName(this.state.timemodels, query.timemodel)}
            options={this.state.timemodels.map(this.makeOption)}
            placeholder={'The time model to use when aggregating.'}
            onChange={(val) => val.value?.name !== timemodel && this.onQueryTimemodelChange(val.value!)}
          />
        )}
      </div>
    );
  }
}
