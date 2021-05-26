import React, { PureComponent } from 'react';
import { AppRootProps, KeyValue } from '@grafana/data';

import { Spinner } from '@grafana/ui';
import { BillingsPage, DatapointsPage, ProjectsPage, SubsystemsPage } from 'pages';
import { SensetifAppSettings } from 'types';

interface Props extends AppRootProps<SensetifAppSettings> {}
interface State {
  page?: React.ReactNode;
}

export class SensetifRootPage extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  async componentDidMount() {
    this.setState({
      page: this.getPage(this.props.query),
    });
  }

  getPage = (query: KeyValue<any>): React.ReactNode => {
    switch (query['tab']) {
      case ProjectsPage.id: {
        return <ProjectsPage.component {...this.props} />;
      }

      case SubsystemsPage.id: {
        return <SubsystemsPage.component {...this.props} />;
      }

      case DatapointsPage.id: {
        return <DatapointsPage.component {...this.props} />;
      }

      case BillingsPage.id: {
        return <BillingsPage.component {...this.props} />;
      }

      default:
        return <ProjectsPage.component {...this.props} />;
    }
  };

  render() {
    return this.state.page || <Spinner />;
  }
}
