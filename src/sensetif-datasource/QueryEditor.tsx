import React, { PureComponent } from 'react';
import { QueryEditorProps, SelectableValue } from '@grafana/data';
import { Select } from '@grafana/ui';

import { DataSource } from './datasource';
import { defaultQuery, SensetifDataSourceOptions, SensetifQuery } from './types';
import { defaults } from 'lodash';
import { datapoint, loadDatapoints, loadProjects, loadSubsystems, project, subsystem } from './api';


type Props = QueryEditorProps<DataSource, SensetifQuery, SensetifDataSourceOptions>;

// project/subsystem/datapoint implements that
interface WithNameAndTitle {
  name: string;
  title: string
}

interface State {
  projects: project[];
  subsystems: subsystem[];
  datapoints: datapoint[];
}

export class QueryEditor extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      datapoints: [],
      subsystems: [],
      projects: [],
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

  options = (values: WithNameAndTitle[]): Array<SelectableValue<WithNameAndTitle>> => values.map((p) => ({
    label: p.title,
    value: p
  }))

  reloadProjects = async () => {
    try {
      const projects = await loadProjects();

      this.setState({
        projects: projects,
      });
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

      this.setState({
        subsystems: subsystems,
      });
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

      this.setState({
        datapoints: datapoints,
      });
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


  getOptionByName = (name: string, values: WithNameAndTitle[]): SelectableValue<WithNameAndTitle> => {
    const val = values.find(p => p.name === name)
    return {
      label: val?.title,
      value: val
    }
  }

  render() {
    const defQuery = this.getDefaultQuery();
    const query = defaults(this.props.query, defQuery);
    const { project: project, subsystem: subsystem, datapoint: datapoint } = query;

    const projectOptions = this.options(this.state.projects);
    const subsystemOptions = this.options(this.state.subsystems);
    const datapointOptions = this.options(this.state.datapoints);

    const selectedProject = this.getOptionByName(project, this.state.projects)
    const selectedSubsystem = this.getOptionByName(subsystem, this.state.subsystems)
    const selectedDatapoint = this.getOptionByName(datapoint, this.state.datapoints)

    return (
      <div className="gf-form">
        <Select<project>
          value={selectedProject}
          allowCustomValue
          options={projectOptions}
          onChange={(val) => this.onQueryProjectChange(val.value!)}
          placeholder={'The project to be queried'}
        />
        {!project.startsWith("_") && (
          <Select<subsystem>
            value={selectedSubsystem}
            allowCustomValue
            options={subsystemOptions}
            onChange={(val) => val.value?.name !== subsystem && this.onQuerySubsystemChange(val.value!)}
            placeholder={'The Subsystem within the project to be queried'}
          />
        )}
        {!project.startsWith("_") && !subsystem.startsWith("_") && (
          <Select<datapoint>
            value={selectedDatapoint}
            allowCustomValue
            options={datapointOptions}
            onChange={(val) => val.value?.name !== datapoint && this.onQueryDatapointChange(val.value!)}
            placeholder={'The Datapoint in the Subsystem'}
          />
        )}
      </div>
    );
  }
}