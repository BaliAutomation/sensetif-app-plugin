import React, { FC } from 'react';
import { SubsystemSettings } from '../types';
import { Button, Field, FieldSet, Form, HorizontalGroup, Input } from '@grafana/ui';
import { PATTERN_NAME } from './common';

interface Props {
  subsystem?: SubsystemSettings;
  onSubmit: (data: SubsystemSettings, event?: React.BaseSyntheticEvent) => void | Promise<void>;
  onCancel: () => void;
}

export const SubsystemForm: FC<Props> = ({ subsystem, onSubmit, onCancel }) => {
  return (
    <Form<SubsystemSettings>
      onSubmit={onSubmit}
      defaultValues={{
        name: subsystem?.name,
        title: subsystem?.title,
        locallocation: subsystem?.locallocation,
      }}
    >
      {({ register, errors }) => {
        return (
          <>
            <FieldSet label="Subsystem details">
              <Field label="Name" invalid={!!errors.name} error={errors.name && errors.name.message}>
                <Input
                  {...register('name', {
                    required: 'Subsystem name is required',
                    pattern: {
                      value: PATTERN_NAME,
                      message: 'Allowed letters, numbers and "_". Must start with a letter.',
                    },
                  })}
                  css=""
                  readOnly={!!subsystem}
                  placeholder="Subsystem name"
                />
              </Field>

              <Field label="Title" invalid={!!errors.title} error={errors.title && errors.title.message}>
                <Input
                  {...register('title', {
                    required: 'Subsystem title is required',
                  })}
                  css=""
                  placeholder="Subsystem title"
                />
              </Field>

              <Field
                label="Local Location"
                invalid={!!errors.locallocation}
                error={errors.locallocation && errors.locallocation.message}
              >
                <Input
                  {...register('locallocation', {
                    required: 'Location is required',
                  })}
                  placeholder="Local location"
                  css=""
                />
              </Field>
              <HorizontalGroup>
                <Button type="button" variant={'secondary'} onClick={onCancel}>
                  {'Cancel'}
                </Button>
                <Button type="submit">{!!subsystem ? 'Update' : 'Save'}</Button>
              </HorizontalGroup>
            </FieldSet>
          </>
        );
      }}
    </Form>
  );
};
