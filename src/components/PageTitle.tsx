import { Button, getTheme } from '@grafana/ui';
import React from 'react';

interface TitleProps {
  title?: string;
  subtitle?: string;
}

export interface Props extends TitleProps {
  buttonText: string;
  onClick: () => void;
}

export const PageHeader = ({ title, subtitle, buttonText, onClick }: Props) => {
  return (
    <div className="page-action-bar">
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
        <PageTitle title={title} subtitle={subtitle} />

        <Button icon="plus" variant="secondary" onClick={onClick}>
          {buttonText}
        </Button>
      </div>
    </div>
  );
};

const PageTitle = ({ title, subtitle }: TitleProps) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <span style={{ fontSize: getTheme().typography.heading.h1 }}>{title}</span>
      <span style={{ fontSize: getTheme().typography.heading.h5 }}>{subtitle}</span>
    </div>
  );
};
