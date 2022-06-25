import { useMemo } from 'react';
import { AppRootProps, NavModelItem } from '@grafana/data';
import { PageDefinition, PageID } from 'pages';
import { APP_SUBTITLE, APP_TITLE } from './consts';

type Args = {
  meta: AppRootProps['meta'];
  pages: PageDefinition[];
  path: string;
  tab: string;
};

export function useNavModel({ meta, pages, path, tab }: Args) {
  return useMemo(() => {
    const tabs: NavModelItem[] = [];

    const projectsPage: PageID = 'projects';

    pages.forEach(({ text, icon, id }) => {
      tabs.push({
        text,
        icon,
        id,
        url: `${path}?tab=${id}`,
      });

      if (tab === id) {
        tabs[tabs.length - 1].active = true;
      }
    });

    // Fallback if current `tab` doesn't match any page
    if (!tabs.some(({ active }) => active)) {
      tabs[0].active = true;
    }

    const node = {
      text: APP_TITLE,
      img: meta.info.logos.large,
      subTitle: APP_SUBTITLE,
      breadcrumbs: [
        {
          title: APP_TITLE,
          url: `/a/${meta.id}/?tab=${projectsPage}`,
        },
      ],
      url: path,
    };

    return {
      node,
      main: node,
    };
  }, [meta.info.logos.large, meta.id, pages, path, tab]);
}
