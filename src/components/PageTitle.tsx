import { Button, getTheme, IconName } from '@grafana/ui';
import React from 'react';

interface TitleProps {
  title?: string;
  subtitle?: string;
}

export interface Props extends TitleProps {
  primaryText: string;
  primaryIcon?: IconName;
  onPrimaryClick: () => void;

  secondaryText?: string;
  secondaryIcon?: IconName;
  onSecondaryClick?: () => void;
}

export const PageHeader = ({
  title,
  subtitle,

  primaryText,
  primaryIcon,
  onPrimaryClick,

  secondaryText,
  secondaryIcon,
  onSecondaryClick,
}: Props) => {
  return (
    <div className="page-action-bar">
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
        <PageTitle title={title} subtitle={subtitle} />

        <div>
          {secondaryText && onSecondaryClick && (
            <Button
              icon={secondaryIcon ?? 'arrow-left'}
              variant="secondary"
              onClick={onSecondaryClick}
              style={{ marginRight: '8px' }}
            >
              {secondaryText}
            </Button>
          )}

          <Button icon={primaryIcon ?? 'plus'} variant="primary" onClick={onPrimaryClick}>
            {primaryText}
          </Button>
        </div>
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
