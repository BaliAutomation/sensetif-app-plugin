import React, { useState, useEffect } from 'react';
import { Checkbox, TagList } from '@grafana/ui';
import { css } from '@emotion/css';

type devicePayload = { name: string; payload: any };

type state = {
  selectedFields: string[];
  //   matchingDevices: string[];
};
export const TemplateCreator = ({
  selectedDeviceId,
  selectedPayload,
  devicesPayloads,
}: {
  selectedDeviceId: string;
  selectedPayload: any;
  devicesPayloads: devicePayload[];
}) => {
  let [state, setState] = useState<state>({
    selectedFields: [],
    // matchingDevices: [],
  });

  useEffect(() => {
    if (!selectedPayload) {
      setState({
        // matchingDevices: [],
        selectedFields: [],
      });
      return;
    }
  }, [selectedPayload]);

  if (!selectedPayload) {
    return <>empty payload</>;
  }

  return (
    <>
      <h3>{`payload from device: ${selectedDeviceId}:`}</h3>
      <pre>{JSON.stringify(selectedPayload)}</pre>

      {/* select fields */}
      <ul>
        {Object.entries(selectedPayload).map(([name, v]) => (
          <li key={name}>
            <Checkbox
              label={`${name} ${isSupported(v) ? '' : ' - objects are not supported'}`}
              value={state.selectedFields.includes(name)}
              onChange={(p) => {
                // let { selectedFields, matchingDevices } = state;
                let { selectedFields } = state;

                // @ts-ignore
                if (p.target.checked) {
                  //
                  selectedFields.push(name);
                } else {
                  selectedFields.splice(
                    selectedFields.findIndex((el) => el === name),
                    1
                  );
                }
                setState({
                  //   matchingDevices: matchingDevices,
                  selectedFields: selectedFields,
                });
              }}
              disabled={!isSupported(v)}
            />
          </li>
        ))}
      </ul>

      {/* matching devices */}
      <>
        <h2>Matching devices::</h2>
        {devicesPayloads && state && (
          <MatchingDevices devicesPayloads={devicesPayloads} selectedProps={state.selectedFields} />
        )}
      </>
    </>
  );
};

const isSupported = (val: any): boolean => {
  return typeof val !== 'object';
};

const MatchingDevices = ({
  devicesPayloads,
  selectedProps,
}: {
  devicesPayloads: devicePayload[];
  selectedProps: string[];
}) => {
  const deviceNames = devicesPayloads.filter((p) => filterPayload(p.payload, selectedProps)).map((p) => p.name);

  return (
    <TagList
      tags={deviceNames}
      className={css`
        justify-content: left;
      `}
    />
  );
};

const filterPayload = (payload: any, fields: string[]): boolean => {
  if (payload === undefined || payload === null) {
    return false;
  }

  for (let field of fields) {
    if (payload[field] === null) {
      return false;
    }
    if (payload[field] === undefined) {
      return false;
    }

    if (typeof payload[field] === 'object') {
      return false;
    }
  }

  return true;
};
