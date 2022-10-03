import React, { useState, useEffect } from 'react';
import { Checkbox, TagList } from '@grafana/ui';
import { css } from '@emotion/css';

type devicePayload = {
  name: string;
  payload: any;
};

type template = {
  [name: string]: { checked: boolean };
};

export const TemplateCreator = ({
  selectedPayload,
  devicesPayloads,
}: {
  selectedPayload: any;
  devicesPayloads: devicePayload[];
}) => {
  let [template, setTemplate] = useState<template>();

  //   // refresh on payload change
  useEffect(() => {
    console.log('[Template Creator] useEffect');
    setTemplate({});
  }, [selectedPayload]);

  if (!selectedPayload) {
    return <>empty payload</>;
  }

  return (
    <>
      {/* select fields */}
      <ul>
        {Object.entries(selectedPayload).map(([name, v]) => (
          <li key={name}>
            <Checkbox
              label={`${name} ${isSupported(v) ? '' : ' - objects are not supported'}`}
              value={template?.[name]?.checked}
              onChange={(p) => {
                // console.log(' [onChange]', p);
                // let [_selectedFields] = [selectedFields];
                // // @ts-ignore
                // if (!p.target.checked) {
                //   console.log();
                //   _selectedFields.push(name);
                // } else {
                //   _selectedFields.splice(
                //     _selectedFields.findIndex((el) => el === name),
                //     1
                //   );
                // }

                // setSelectedFields(_selectedFields);
                setTemplate((t) => ({
                  ...t,
                  [name]: { checked: !t?.[name]?.checked },
                }));
              }}
              disabled={!isSupported(v)}
            />
          </li>
        ))}
      </ul>

      {/* matching devices */}
      <>
        <h2>Matching devices::</h2>
        {devicesPayloads && template && (
          <MatchingDevices
            devicesPayloads={devicesPayloads}
            selectedProps={Object.keys(template).filter((k) => template?.[k].checked)}
          />
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
