import { useMemo } from 'react';
import { pages, ProjectsPage } from 'pages';
import { APP_SUBTITLE, APP_TITLE } from './consts';
import { AppPluginMeta, NavModelItem } from '@grafana/data';

type Args = {
  meta: AppPluginMeta;
  path: string;
  tab: string;
};

export function useNavModel({ meta, path, tab }: Args) {
  return useMemo(() => {
    const node: NavModelItem = {
      text: pages[tab].text,
      img: meta.info.logos.large,
      subTitle: APP_SUBTITLE,
      breadcrumbs: [
        {
          title: APP_TITLE,
          url: `/a/${meta.id}/?tab=${ProjectsPage.id}`,
        },
      ],
      url: path,
    };

    return {
      node,
      main: node,
    };
  }, [meta.info.logos.large, meta.id, path, tab]);
}
