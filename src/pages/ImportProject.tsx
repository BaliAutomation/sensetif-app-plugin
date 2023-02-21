import React, { FC } from 'react';
import { goToTab } from '../utils/navigation';
import { ImportProjectTypeList } from '../components/ImportProjectTypesList';
import { getTheme } from '@grafana/ui';
import { PageID } from './index';

interface Props {
}

export const ImportProject: FC<Props> = () => {
  return (
    <>
      <div style={{ fontSize: getTheme().typography.heading.h1 }}>{'Import Project'}</div>
      <div style={{ fontSize: getTheme().typography.heading.h5 }}>{'Select integration system to import from'}</div>
      <hr />
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
        <ImportProjectTypeList onClick={(tab: PageID) => {
          goToTab(tab);
        }}
        />
      </div>
    </>
  );
};
