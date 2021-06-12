import React, { FC } from 'react';
import { SubsystemSettings } from '../types';
import { Button, Field, FieldSet, Form, Input } from '@grafana/ui';

interface Props {
  editable?: boolean;
  subsystem?: SubsystemSettings;
  onSubmit: (data: SubsystemSettings, event?: React.BaseSyntheticEvent) => void | Promise<void>;
}

export const SubsystemForm: FC<Props> = ({ editable, subsystem, onSubmit }) => {
  return (
    <Form<SubsystemSettings>
      onSubmit={onSubmit}
      defaultValues={{
        name: subsystem?.name,
        locallocation: subsystem?.locallocation,
      }}
    >
      {({ register, errors }) => {
        return (
          <>
            <FieldSet label="Subsystem details">
              <Field label="Name" invalid={!!errors.name} error={errors.name && errors.name.message}>
                <Input
                  disabled={!editable}
                  placeholder="Subsystem name"
                  name="name"
                  ref={register({
                    required: 'Subsystem name is required',
                    pattern: { value: /[a-z][A-Za-z0-9_]*/, message: 'Allowed letters, numbers and characters: _, * ' },
                  })}
                />
              </Field>

              <Field label="Title" invalid={!!errors.title} error={errors.title && errors.title.message}>
                <Input
                  disabled={!editable}
                  placeholder="Subsystem title"
                  name="title"
                  ref={register({
                    required: 'Subsystem title is required',
                  })}
                />
              </Field>

              <Field
                label="Local Location"
                invalid={!!errors.locallocation}
                error={errors.locallocation && errors.locallocation.message}
              >
                <Input
                  disabled={!editable}
                  placeholder="Local location"
                  name="location"
                  ref={register({
                    required: 'Location is required',
                  })}
                />
              </Field>
              <Button type="submit">{editable ? 'Update' : 'Save'}</Button>
            </FieldSet>
          </>
        );
      }}
    </Form>
  );
};
