import React, { useEffect } from 'react';
import { useAsyncFn } from 'react-use';

import { SelectableValue } from '@grafana/data';
import { AsyncSelect } from '@grafana/ui';
import { getProjects } from 'utils/api';
import { ProjectSettings } from 'types';

export type ProjectSelectItem = SelectableValue<ProjectSettings>;

export interface Props {
  onSelected: (project: ProjectSelectItem) => void;
  className?: string;
  inputId?: string;
  autoFocus?: boolean;
}

export function ProjectSelector({ onSelected, className, inputId, autoFocus }: Props) {
  // For whatever reason the autoFocus prop doesn't seem to work
  // with AsyncSelect, hence this workaround. Maybe fixed in a later version?
  useEffect(() => {
    if (autoFocus && inputId) {
      document.getElementById(inputId)?.focus();
    }
  }, [autoFocus, inputId]);

  const [_, getOrgOptions] = useAsyncFn(async () => {
    const projects: ProjectSettings[] = await getProjects()
    return projects.map((project) => ({ value: project, label: project.name }));
  });

  return (
    <AsyncSelect
      inputId={inputId}
      className={className}
      defaultOptions={true}
      isSearchable={true}
      loadOptions={getOrgOptions}
      onChange={onSelected}
      placeholder="Select proejct"
      noOptionsMessage="No projects found"
    />
  );
}
