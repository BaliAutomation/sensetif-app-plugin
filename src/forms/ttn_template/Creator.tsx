import React, { useState, useEffect } from 'react';
import { Checkbox, ConfirmModal } from '@grafana/ui';

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
      body={Object.entries(selectedPayload).map(([name, v]) => (
        <div key={name}>
          <Checkbox
            label={`${name} ${isSupported(v) ? '' : ' - objects are not supported'}`}
            value={template?.[name]?.checked}
            onChange={() => onSelect(name)}
            disabled={!isSupported(v)}
          />
        </div>
      ))}
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
