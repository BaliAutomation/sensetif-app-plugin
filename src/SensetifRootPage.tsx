import React, { useEffect, useMemo } from 'react';
import { AppRootProps } from '@grafana/data';
import { useNavModel } from 'utils/hooks';
import { pages } from 'pages';

export const SensetifRootPage = React.memo(function RootPage(props: AppRootProps) {
  const {
    path,
    onNavChanged,
    query: { tab },
    meta,
  } = props;
  // Required to support grafana instances that use a custom `root_url`.
  const pathWithoutLeadingSlash = path.replace(/^\//, '');

  // Update the navigation when the tab or path changes
  const navModel = useNavModel(
    useMemo(() => ({ tab, pages, path: pathWithoutLeadingSlash, meta }), [meta, pathWithoutLeadingSlash, tab])
  );
  useEffect(() => {
    onNavChanged(navModel);
  }, [navModel, onNavChanged]);

  const Page = pages.find(({ id }) => id === tab)?.component || pages[0].component;
  return <Page {...props} path={pathWithoutLeadingSlash} />;
});
