import React, { FC } from 'react';
import { ParametersDatasource } from '../../types';
import { UseFormReturn } from 'react-hook-form';

import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
} from '@tanstack/react-table'

import { StyledTable } from 'components/StyledTable';


interface Props extends UseFormReturn<ParametersDatasource> {
    ds: ParametersDatasource;
}

export const defaultValues: ParametersDatasource = {
    parameters: {}
};

export const ParametersDatasourceForm: FC<Props> = ({ ds }, theme) => {
    const data = Object.entries(ds.parameters).map(([k, v]) => ({
        name: k,
        value: v
    }))

    const columns = [
        {
            header: 'Name',
            accessorKey: 'name',
        },
        {
            header: 'Value',
            accessorKey: 'value'
        }
    ]

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        debugTable: true,
    })

    return (
        <>
            <div>
                <StyledTable table={table} />
            </div>
        </>
    );
};
