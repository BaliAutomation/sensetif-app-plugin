import { FilterInput } from '@grafana/ui';
import React from 'react';
import { HeaderGroup } from 'react-table';

export const HeaderRow = ({ headerGroups }: { headerGroups: Array<HeaderGroup<any>> }) => {
  return (
    <thead>
      {
        // Loop over the header rows
        headerGroups.map((headerGroup, idx) => (
          // Apply the header row props
          <tr {...headerGroup.getHeaderGroupProps()} key={idx}>
            {
              // Loop over the headers in each row
              headerGroup.headers.map((column, idx) => (
                // Apply the header cell props
                <th {...column.getHeaderProps()} key={idx}>
                  {
                    // Render the header
                    column.render('Header')
                  }
                  {
                    //@ts-ignore
                    //   column.canFilter && column.render('Filter')
                    column.canFilter && <SimpleColumnFilter column={column} />
                  }
                </th>
              ))
            }
          </tr>
        ))
      }
    </thead>
  );
};

const SimpleColumnFilter = ({
  //@ts-ignore
  column: { filterValue, preFilteredRows, setFilter },
}) => {
  const count = preFilteredRows.length;

  return (
    <FilterInput
      value={filterValue || ''}
      // onChange={useAsyncDebounce(setFilter, 200)}
      onChange={setFilter}
      placeholder={`Search ${count} records...`}
    />
  );
};
