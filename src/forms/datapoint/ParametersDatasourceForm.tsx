import React, {FC} from 'react';
import {ParametersDatasource} from '../../types';
import {UseFormReturn} from 'react-hook-form';
import {Table} from "@grafana/ui";
import {ArrayVector, DataFrame, FieldType} from "@grafana/data";


interface Props extends UseFormReturn<ParametersDatasource> {
    ds?: ParametersDatasource;
}

export const defaultValues: ParametersDatasource = {
    parameters: {}
};

export const ParametersDatasourceForm: FC<Props> = ({ds}) => {
    if (ds === undefined) {
        return (<> </>);
    }
    let dsKeys = [];
    let dsVals = [];
    let length = 0;
    for (let i in ds.parameters) {
        dsKeys.push(i);
        dsVals.push(ds.parameters[i]);
        length += 1;
    }
    let keys: ArrayVector<string> = new ArrayVector<string>(dsKeys);
    let values: ArrayVector<string> = new ArrayVector<string>(dsVals);

    let frame: DataFrame = {
        fields: [
            {
                name: "name",
                type: FieldType.string,
                config: {},
                values: keys
            },
            {
                name: "value",
                type: FieldType.string,
                config: {},
                values: values
            }
        ],
        length: length
    }
    return (
        <>
            <div>
                <Table data={frame} width={150} height={150} columnMinWidth={150} enablePagination={false}/>
            </div>
        </>
    );
};
