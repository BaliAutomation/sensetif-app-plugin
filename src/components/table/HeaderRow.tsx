import { FilterInput } from '@grafana/ui';
import React from 'react';
import { HeaderGroup } from 'react-table';

export const HeaderRow = <T extends Object>({ headerGroups }: { headerGroups: Array<HeaderGroup<T>> }) => {
  const getThProps = (column: HeaderGroup<T>) => {
    // @ts-ignore
    if (column.sortable) {
      // @ts-ignore
      return { ...column.getHeaderProps(column.getSortByToggleProps()) };
    }

    return { ...column.getHeaderProps() };
  };

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
                <th {...getThProps(column)} key={column.id}>
                  <div>
                    {
                      // Render the header
                      column.render('Header')
                    }
                    {/* @ts-ignore */}
                    {column.sortable && (
                      <span>
                        {/* @ts-ignore */}
                        {column.isSorted ? (column.isSortedDesc ? ' 🔽' : ' 🔼') : ''}
                      </span>
                    )}
                  </div>
                  {
                    //@ts-ignore
                    //   column.canFilter && column.render('Filter')
                    column.filterable && <SimpleColumnFilter column={column} />
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
