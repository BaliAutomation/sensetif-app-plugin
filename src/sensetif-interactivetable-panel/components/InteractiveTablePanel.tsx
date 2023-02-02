import React from 'react';
import { DataQuery, dateTimeFormatISO, PanelData, PanelProps } from '@grafana/data';
import { SimpleOptions } from '../types';
import { css, cx } from '@emotion/css';
// import { useStyles2, useTheme2 } from '@grafana/ui';
import { Button, ConfirmModal, useStyles2 } from '@grafana/ui';
import { InteractiveTable, UpdateValue } from './InteractiveTable';
import { TsPair } from 'types';
import { updateTimeseriesValues } from 'utils/api';

interface Props extends PanelProps<SimpleOptions> { }

const getStyles = () => {
  return {
    wrapper: css`
      height: 100%;
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
  if (!isValidData(data)) {
    console.warn("panel is only comaptible with sensetif datasource")
  }

  const [showConfirmation, setShowConfirmation] = React.useState<boolean>()

  const styles = useStyles2(getStyles);

  type updates = {
    [refId: string]: {
      [timestamp: string]: number
    }
  }

  type request = {
    project: string;
    subsystem: string;
    datapoint: string;
    tsPairs: TsPair[]
  }

  const [state, setState] = React.useState<updates>({})

  const makeRequests = (): request[] => {
    return Object.keys(state).map((refId) => {
      const query = getQueryByRefId(refId, data.request?.targets!);
      const tsPairs = Object.entries(state[refId]).map(([timestamp, value]) => ({
        ts: timestamp,
        value: value,
      }))

      return {
        project: query.project,
        subsystem: query.subsystem,
        datapoint: query.datapoint,
        tsPairs: tsPairs
      }
    })
  }

  const onUpdate = (value: UpdateValue) => {
    setState(state => {
      let copy = { ...state }
      if (!copy[value.refId]) {
        copy[value.refId] = {}
      }

      copy[value.refId][dateTimeFormatISO(value.time)] = value.value

      return copy
    })
  }

  if (showConfirmation) {
    return <ConfirmModal
      title={"Update values confirmation"}
      isOpen={showConfirmation}
      confirmText={"Confirm"}
      onConfirm={() => {
        makeRequests().forEach(req => {
          updateTimeseriesValues(req.project, req.subsystem, req.datapoint, req.tsPairs)
        })
      }}
      onDismiss={() => setShowConfirmation(false)}
      body={<>
        <pre>{JSON.stringify(makeRequests(), null, ' ')}</pre>
      </>}
    />
  }

  return (
    <div
      className={css`
          width: ${width}px;
          height: ${height}px;
        `}
    >
      <Button onClick={() => { setShowConfirmation(true) }}>Confirm Update</Button>
      <div className={cx(styles.wrapper)}>
        <InteractiveTable
          frames={data.series}
          onUpdate={onUpdate} />
      </div>
    </div>
  );
};

//todo: extract to common 'sensetif' package
type sensetifQuery = DataQuery & {
  project: string;
  subsystem: string;
  datapoint: string;
}

const getQueryByRefId = (refId: string, queries: DataQuery[]): sensetifQuery => {
  let query = queries.find(q => q.refId === refId)
  return query as sensetifQuery
}

const isValidData = (data: PanelData): boolean => {
  const targets = data.request?.targets
  if (!targets) {
    return false
  }

  for (let target of targets) {
    if (target.datasource?.type !== "sensetif-datasource") {
      return false
    }
  }

  return true
}
