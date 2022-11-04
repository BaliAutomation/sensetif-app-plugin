import React, { useState, useEffect } from 'react';
import { Badge, Checkbox, ConfirmModal, CustomScrollbar } from '@grafana/ui';

type template = {
  [name: string]: { checked: boolean };
};

export const TemplateCreatorModal = ({
  isOpen,
  selectedPayload,
  onDismiss,
  onConfirm,
}: {
  isOpen: boolean;
  selectedPayload: any;
  onConfirm: (properties: string[]) => void;
  onDismiss: () => void;
}) => {
  let [template, setTemplate] = useState<template>();

  // refresh on payload change
  useEffect(() => {
    setTemplate({});
  }, [selectedPayload]);

  const onSelect = (name: string) => {
    setTemplate((t) => ({
      ...t,
      [name]: { checked: !t?.[name]?.checked },
    }));
  };

  if (!selectedPayload) {
    return null;
  }

  return (
    <ConfirmModal
      isOpen={isOpen}
      title="Select datapoints to be imported"
      body={
        <CustomScrollbar autoHeightMax='410px'>
        {Object.entries(selectedPayload).map(([name, v]) => (
        <div key={name}>
          <Checkbox
            value={template?.[name]?.checked}
            onChange={() => onSelect(name)}
            disabled={!isSupported(v)}
          >
          </Checkbox>
            {' '}<Badge text={name} color="blue"/>
            {!isSupported(v) && <span> - objects are not supported</span>}
        </div>
      ))}
      </CustomScrollbar>
      }
      confirmText="Confirm"
      onConfirm={() => {
        const selectedProps = Object.keys(template ?? {}).filter((k) => template?.[k].checked);
        onConfirm(selectedProps);
      }}
      onDismiss={onDismiss}
    />
  );
};

const isSupported = (val: any): boolean => {
  return typeof val !== 'object';
};
