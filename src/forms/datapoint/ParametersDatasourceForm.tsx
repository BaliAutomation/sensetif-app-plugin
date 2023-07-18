import React, {FC} from 'react';
import {ParametersDatasource} from '../../types';
import {UseFormReturn} from 'react-hook-form';
import {Table} from "@grafana/ui";
import {
    applyFieldOverrides,
    ArrayVector,
    DataFrame,
    Field,
    FieldType
} from "@grafana/data";


interface Props extends UseFormReturn<ParametersDatasource> {
    ds?: ParametersDatasource;
}

export const defaultValues: ParametersDatasource = {
    parameters: {}
};

export const ParametersDatasourceForm: FC<Props> = ({ds}, theme) => {
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

    let keyField: Field<string> = {
        name: "name",
        type: FieldType.string,
        config: {},
        values: keys
    };
    let valueField: Field<string> = {
        name: "value",
        type: FieldType.string,
        config: {
            writeable: true,
        },
        values: values
    };
    let frame: DataFrame = {
        fields: [ keyField, valueField ],
        length: length
    }
    let frames = applyFieldOverrides({
        data: [frame],
        fieldConfig: {
            overrides: [],
            defaults: {},
        },
        theme,
        replaceVariables: (value: string) => value,
    });
    let frameIdx = 0;
    return (
        <>
            <div>
                <Table data={frames[frameIdx]} width={300} height={300} columnMinWidth={150} enablePagination={false}/>
            </div>
        </>
    );
};
