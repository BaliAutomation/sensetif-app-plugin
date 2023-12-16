import React, { useEffect } from 'react';
import { useAsyncFn } from 'react-use';

import { SelectableValue } from '@grafana/data';
import { AsyncSelect } from '@grafana/ui';
import { listScripts } from 'utils/api';
import { Script } from 'types';

export type ScriptSelectItem = SelectableValue<Script>;

export interface Props {
  onSelected: (script: ScriptSelectItem) => void;
  className?: string;
  inputId?: string;
  autoFocus?: boolean;
}

export function ScriptSelector({ onSelected, className, inputId, autoFocus }: Props) {
  // For whatever reason the autoFocus prop doesn't seem to work
  // with AsyncSelect, hence this workaround. Maybe fixed in a later version?
  useEffect(() => {
    if (autoFocus && inputId) {
      document.getElementById(inputId)?.focus();
    }
  }, [autoFocus, inputId]);

  const [_, getOrgOptions] = useAsyncFn(async () => {
    const scripts: Script[] = await listScripts()
    return scripts.map((script) => ({ value: script, label: script.name }));
  });

  return (
    <AsyncSelect
      inputId={inputId}
      className={className}
      defaultOptions={true}
      isSearchable={true}
      loadOptions={getOrgOptions}
      onChange={onSelected}
      placeholder="Select organization"
      noOptionsMessage="No organizations found"
    />
  );
}
