import React from 'react';
import { SimpleOptions } from '../types';
import { AlertErrorPayload, AlertPayload, AppEvents, DataQuery, PanelData, PanelProps } from '@grafana/data';
import { css, cx } from '@emotion/css';
// import { useStyles2, useTheme2 } from '@grafana/ui';
import { Button, ConfirmModal, Icon, useStyles2 } from '@grafana/ui';
import { InteractiveTable, UpdateValue } from './InteractiveTable';
import {  TsPair } from 'types';
import { updateTimeseriesValues } from 'utils/api';
import { getAppEvents } from '@grafana/runtime';

interface Props extends PanelProps<SimpleOptions> {
}

export const SimplePanel: React.FC<Props> = ({ options, data, width, height }) => {
  if (!isValidData(data)) {
    console.warn('panel is only comaptible with sensetif datasource');
  }


  const appEvents = getAppEvents();
  const notifySuccess = (payload: AlertPayload) => appEvents.publish({ type: AppEvents.alertSuccess.name, payload });
  const notifyError = (payload: AlertErrorPayload) => appEvents.publish({ type: AppEvents.alertError.name, payload });

  const [showConfirmation, setShowConfirmation] = React.useState<boolean>()
  const [isProcessing, setIsProcessing] = React.useState<boolean>(false)


  const styles = useStyles2(() => ({
    wrapper: css`
      height: 100%;
      position: relative;
    `,
  }));

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

  const [state, setState] = React.useState<updates>({});


  const makeRequests = (): request[] => {
    return Object.keys(state).map((refId) => {
      const query = getQueryByRefId(refId, data.request?.targets!);
      const tsPairs = Object.entries(state[refId]).map(([timestamp, value]) => ({
        ts: timestamp,
        value: value,
      }));

      return {
        project: query.project,
        subsystem: query.subsystem,
        datapoint: query.datapoint,
        tsPairs: tsPairs
      };
    });
  };

  const onUpdate = (value: UpdateValue) => {
    setState(state => {
      let copy = { ...state };
      if (!copy[value.refId]) {
        copy[value.refId] = {};
      }
      const formattedTime = new Date(value.time).toJSON(); // hackish, but the Grafana documentation is lying in the TsDoc, and doesn't generate millis in the call below
      // copy[value.refId][dateTimeFormatISO(value.time, { timeZone: 'utc' })] = value.value;
      copy[value.refId][formattedTime] = value.value;
      return copy;
    });
  };

  if (isProcessing) {
    return <><Icon name="fa fa-spinner" style={{ color: 'white' }} />
      <span> Updating...</span>
    </>
  }

  if (showConfirmation) {
    let preview = () => (<div>
      <div><span><i>project/subsystem/datapoint: updates</i></span></div>
      {makeRequests().map((r, idx) => (
        <div key={idx}><span>{r.project}/{r.subsystem}/{r.datapoint}: {r.tsPairs.length}</span></div>
      ))}</div>)

    return <ConfirmModal
      title={'Update values confirmation'}
      isOpen={showConfirmation}
      confirmText={"Confirm"}
      onConfirm={async () => {
        let updateRequests = makeRequests()
          .map(req => updateTimeseriesValues({
            projectName: req.project,
            subsystemName: req.subsystem,
            datapointName: req.datapoint,
            values: req.tsPairs
          }))

        setIsProcessing(true)
        await Promise.all(updateRequests)
          .then(() => { setState({}); notifySuccess(['Values updated.']) })
          .catch(e => { notifyError(['Failed to update values.']) })
          .finally(() => { setIsProcessing(false); setShowConfirmation(false) })

      }}
      onDismiss={() => setShowConfirmation(false)}
      body={preview()}
    />
  }

  return (
    <div
      className={css`
        width: ${width}px;
        height: ${height}px;
      `}
    >

      <Button
        disabled={Object.keys(state).length === 0}
        onClick={() => { setShowConfirmation(true) }}>
        {'Confirm Update'}
      </Button>
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
  let query = queries.find(q => q.refId === refId);
  return query as sensetifQuery;
};

const isValidData = (data: PanelData): boolean => {
  const targets = data.request?.targets;
  if (!targets) {
    return false;
  }

  for (let target of targets) {
    if (target.datasource?.type !== 'sensetif-datasource') {
      return false;
    }
  }

  return true;
};
