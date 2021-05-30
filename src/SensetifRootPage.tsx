import { AppRootProps } from '@grafana/data';
// import { Spinner } from '@grafana/ui';
import { pages } from 'pages';
import React, { PureComponent, useEffect, useMemo } from 'react';
import { SensetifAppSettings } from 'types';
import { useNavModel } from 'utils/hooks';

interface State {
  component: React.FC<AppRootProps>;
}

export class SensetifRootPage extends PureComponent<AppRootProps, State> {
  constructor(props: AppRootProps) {
    super(props);
    this.state = {
      component: React.memo(function SensetifRootPage(props: AppRootProps<SensetifAppSettings>) {
        const { path, onNavChanged, query, meta } = props;
        // Required to support grafana instances that use a custom `root_url`.
        const pathWithoutLeadingSlash = path.replace(/^\//, '');
        // Update the navigation when the tab or path changes
        const tab: string = query['tab'];
        const navModel = useNavModel(
          useMemo(() => ({ tab, path: pathWithoutLeadingSlash, meta }), [meta, pathWithoutLeadingSlash, tab])
        );
        useEffect(() => {
          onNavChanged(navModel);
        }, [navModel, onNavChanged]);

        const Page = pages[tab].component;
        return <Page {...props} path={pathWithoutLeadingSlash} />;
      }),
    };
  }

  render() {
    return <this.state.component {...this.props} />;
  }
}
