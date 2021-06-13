import React, { FC } from 'react';
import { ProjectSettings } from '../types';
import { TimeZonePicker, Button, Field, FieldSet, Form, Input, InputControl, Select } from '@grafana/ui';
import { getNames as getCountryNames } from 'country-list';
import { SelectableValue } from '@grafana/data';

interface Props {
  editable?: boolean;
  project?: ProjectSettings;
  onSubmit: (data: ProjectSettings, event?: React.BaseSyntheticEvent) => void | Promise<void>;
}

export const ProjectForm: FC<Props> = ({ editable, project, onSubmit }) => {
  return (
    <Form<ProjectSettings>
      onSubmit={onSubmit}
      defaultValues={{
        name: project?.name,
        title: project?.title,
        city: project?.city,
        geolocation: project?.geolocation,
      }}
    >
      {({ register, errors, control }) => {
        return (
          <>
            <FieldSet label="Project details">
              <Field label="Name" invalid={!!errors.name} error={errors.name && errors.name.message}>
                <Input
                  {...register('name', {
                    required: 'Project name is required',
                    pattern: { value: /[a-z][A-Za-z0-9_]*/, message: 'Allowed letters, numbers and characters: _, * ' },
                  })}
                  disabled={!editable}
                  placeholder="Project name"
                  css=""
                />
              </Field>

              <Field label="Title" invalid={!!errors.title} error={errors.title && errors.title.message}>
                <Input
                  {...register('title', {
                    required: 'Project title is required',
                  })}
                  disabled={!editable}
                  placeholder="Project title"
                  css=""
                />
              </Field>

              <Field label="Country" invalid={!!errors.country} error={errors.country && errors.country.message}>
                <InputControl
                  render={({ field: { onChange, ref, ...field } }) => (
                    <Select
                      {...field}
                      onChange={(value) => onChange(value.value)}
                      options={getCountryNames().map((c) => ({ label: c, value: c } as SelectableValue))}
                    />
                  )}
                  rules={{
                    required: 'Country selection is required',
                  }}
                  control={control}
                  name="country"
                />
              </Field>

              <Field label="City" invalid={!!errors.city} error={errors.city && errors.city.message}>
                <Input
                  {...register('city', {
                    required: 'City is required',
                  })}
                  disabled={!editable}
                  placeholder="City"
                  css=""
                />
              </Field>

              <Field label="Time zone" invalid={!!errors.timezone} error={errors.timezone && errors.timezone.message}>
                <InputControl
                  {...register('timezone', {
                    required: 'Timezone selection is required',
                  })}
                  render={({ field }) => <TimeZonePicker {...field} />}
                  name="timezone"
                  control={control}
                />
              </Field>

              <Field
                label="Geolocation"
                invalid={!!errors.geolocation}
                error={errors.geolocation && errors.geolocation.message}
              >
                <Input
                  {...register('geolocation', {
                    required: 'Geolocation is required',
                  })}
                  disabled={!editable}
                  placeholder="latitude,longitude"
                  css=""
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