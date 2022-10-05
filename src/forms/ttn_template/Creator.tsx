import React, { useState, useEffect } from 'react';
import { Checkbox } from '@grafana/ui';

type template = {
  [name: string]: { checked: boolean };
};

export const TemplateCreator = ({
  selectedPayload,
  onChange,
}: {
  selectedPayload: any;
  onChange: (properties: string[]) => void;
}) => {
  let [template, setTemplate] = useState<template>();

  // refresh on payload change
  useEffect(() => {
    setTemplate({});
  }, [selectedPayload]);

  const onSelect = (name: string) => {
    setTemplate((t) => {
      let newTemplate = {
        ...t,
        [name]: { checked: !t?.[name]?.checked },
      };
      const selectedProps = Object.keys(newTemplate ?? {}).filter((k) => newTemplate?.[k].checked);
      onChange(selectedProps);
      return newTemplate;
    });
  };

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
              onChange={() => onSelect(name)}
              disabled={!isSupported(v)}
            />
          </li>
        ))}
      </ul>
    </>
  );
};

const isSupported = (val: any): boolean => {
  return typeof val !== 'object';
};
