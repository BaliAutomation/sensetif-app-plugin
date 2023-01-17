import React from 'react';
import { PanelProps } from '@grafana/data';
import { SimpleOptions } from '../types';
import { css, cx } from '@emotion/css';
// import { useStyles2, useTheme2 } from '@grafana/ui';
import { useStyles2 } from '@grafana/ui';
import { InteracriveTable } from './Table';

interface Props extends PanelProps<SimpleOptions> {}

const getStyles = () => {
  return {
    wrapper: css`
      font-family: Open Sans;
      position: relative;
    `,
    textBox: css`
      position: absolute;
      bottom: 0;
      left: 0;
      padding: 10px;
    `,
  };
};

export const SimplePanel: React.FC<Props> = ({ options, data, width, height }) => {
  const styles = useStyles2(getStyles);
  return (
    <div
      className={cx(
        styles.wrapper,
        css`
          width: ${width}px;
          height: ${height}px;
        `
      )}
    >
     <InteracriveTable frames={data.series}/>
    </div>
  );
};
