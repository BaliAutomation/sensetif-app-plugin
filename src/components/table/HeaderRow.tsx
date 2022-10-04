import { FilterInput } from '@grafana/ui';
import React from 'react';
import { HeaderGroup } from 'react-table';

export const HeaderRow = ({ headerGroups }: { headerGroups: Array<HeaderGroup<any>> }) => {
  return (
    <thead>
      {
        // Loop over the header rows
        headerGroups.map((headerGroup) => (
          // Apply the header row props
          <tr {...headerGroup.getHeaderGroupProps()} key={headerGroup.id}>
            {
              // Loop over the headers in each row
              headerGroup.headers.map((column) => (
                // Apply the header cell props
                //@ts-ignore
                <th {...column.getHeaderProps(column.getSortByToggleProps())} key={column.id}>
                  <div>
                    {
                      // Render the header
                      column.render('Header')
                    }
                    <span>
                      {/* @ts-ignore */}
                      {column.isSorted ? (column.isSortedDesc ? ' 🔽' : ' 🔼') : ''}
                    </span>
                  </div>
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
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      value={filterValue || ''}
      // onChange={useAsyncDebounce(setFilter, 200)}
      onChange={setFilter}
      placeholder={`Search ${count} records...`}
    />
  );
};
