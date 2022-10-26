import React from 'react';
import { PageID } from '../pages';
import { Button, VerticalGroup } from '@grafana/ui';

export interface ImportType {
  tab: PageID;
  title: string;
  icon: string;
  description: string;
  enabled: boolean;
}

const enabledImportTypes: ImportType[] = [
  {
    enabled: true,
    tab: 'import_things_stack',
    title: 'The Things Stack',
    icon: 'public/plugins/sensetif-app/img/things-network.svg',
    description: 'The Things Stack is a robust yet flexible LoRaWAN Network Server. The Things Stack caters to the needs of demanding LoRaWAN deployments, from covering the essentials to advanced security configurations and device life cycle management. The Things Industries offers a feature-complete LoRaWAN network stack that ticks all the boxes and is compatible with the LoRaWAN Network Reference Architecture.'
  }
];

interface Props {
  onClick: (tab: PageID) => void;
}

export const ImportProjectTypeList = (props: Props) => {
  return (
    <>
      <section className="card-section card-list-layout-list">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr)', gap: '5px' }}>
          {enabledImportTypes.filter((importType, _) => importType.enabled)
            .map((importType, num) => {
              return (
                <ImportTypeCard key={'import-' + num} tab={importType.tab} title={importType.title}
                                description={importType.description}
                                icon={importType.icon} onClick={props.onClick} />
              );
            })}
        </div>
      </section>
    </>
  );
};

interface ImportTypeCardProps {
  tab: PageID;
  title: string;
  description: string;
  icon: string;
  onClick: (tab: PageID) => void;
}

function ImportTypeCard(props: ImportTypeCardProps) {
  return (
    <div aria-label="check-card" className="card-item">
      <VerticalGroup>
        <div style={{ marginBottom: '2em' }}>
          <img src={props.icon} alt={'Icon of ' + props.title} width={'50%'} style={{ marginBottom: '1em' }} />
          <div className="card-item-name">{props.title}</div>
        </div>
        <div>{props.description}</div>
        <div style={{ marginTop: '1em' }} />
        <Button onClick={() => props.onClick(props.tab)}>{'Import from ' + props.title}</Button>
      </VerticalGroup>
    </div>
  );
}
