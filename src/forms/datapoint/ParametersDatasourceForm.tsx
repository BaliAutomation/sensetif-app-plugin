
import React, { FC } from 'react';
import { ParametersDatasource } from '../../types';
import { UseFormReturn } from 'react-hook-form';


interface Props extends UseFormReturn<ParametersDatasource> {
  ds?: ParametersDatasource;
}

export const defaultValues: ParametersDatasource = {
    parameters: {}
};

export const ParametersDatasourceForm: FC<Props> = ({ register, formState: { errors } }) => {
  return (
    <>
    </>
  );
};
