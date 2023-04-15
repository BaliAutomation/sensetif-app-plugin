import React, { useMemo } from 'react';
import { Checkbox, FilterPill, HorizontalGroup, Pagination, useStyles2 } from '@grafana/ui';
import {
  Cell,
  Column,
  TableOptions,
  useFilters,
  usePagination,
  useSortBy,
  useRowSelect,
  useTable,
  CellProps,
  Renderer,
  Row,
} from 'react-table';
import { HeaderRow } from './HeaderRow';
import { getTableStyles } from './styles';

interface Props<T extends Object> {
  frame: T[];
  selectableRows?: boolean;
  columns: Array<{
    id: keyof T;
    displayValue: string;
    filterable?: boolean;
    sortable?: boolean;
    sortType?: string;
    minWidth?: number;
    maxWidth?: number;
    width?: number;
    renderCell?: Renderer<CellProps<{}, any>>;
  }>;
  canHideColumns?: boolean;
  hiddenColumns?: Array<keyof T>;
  pageSize?: number;
  sortBy?: Array<{ id: string; desc: boolean }>;
}

export const Table = <T extends Object>({
  frame,
  columns,
  hiddenColumns,
  pageSize,
  sortBy,
  canHideColumns,
  selectableRows,
}: Props<T>) => {
  const tableStyles = useStyles2(getTableStyles);

  const memoizedData = useMemo(() => {
    if (!frame.length) {
      return [];
    }

    return Array(frame?.length).fill(0);
  }, [frame]);

  const memoizedColumns: ReadonlyArray<Column<T>> = useMemo(() => {
    return columns.map(
      (c) =>
        ({
          // id: idx.toString(),
          id: c.id,
          Header: c.displayValue,
          displayValue: c.displayValue,
          accessor: (_: any, i: number) => {
            return frame[i][c.id];
          },
          minWidth: c.minWidth,
          maxWidth: c.maxWidth,
          width: c.width,
          sortType: c.sortType ?? 'basic',
          sortable: c.sortable,
          filterable: c.filterable,
          Cell: c.renderCell ?? CellComponent,
        } as Column<T>)
    );
  }, [frame, columns]);

  const options: TableOptions<T> = useMemo(
    () => ({
      columns: memoizedColumns,
      data: memoizedData,
      autoResetFilters: false,
      autoResetHiddenColumns: false,
      autoResetPage: false,
      initialState: {
        pageSize: pageSize ?? 50,
        hiddenColumns: hiddenColumns?.map((k) => k.toString()) ?? [],
        sortBy: sortBy ?? [],
      },
    }),
    [sortBy, pageSize, memoizedColumns, memoizedData, hiddenColumns]
  );

  const tableInstance = useTable<T>({ ...options }, useFilters, useSortBy, usePagination, useRowSelect, (hooks) => {
    if (selectableRows) {
      hooks.visibleColumns.push((columns) => [
        // Let's make a column for selection
        {
          id: 'import',
          displayValue: 'Import',
          fitlerable: false,
          sortable: false,
          // The header can use the table's getToggleAllRowsSelectedProps method
          // to render a checkbox
          // @ts-ignore
          Header: ({ getToggleAllPageRowsSelectedProps }) => (
            <div>
              <Checkbox {...getToggleAllPageRowsSelectedProps()} />
            </div>
          ),
          // The cell can use the individual row's getToggleRowSelectedProps method
          // to the render a checkbox
          Cell: ({ row }: CellProps<T>) => (
            <div>
              {/* @ts-ignore */}
              <Checkbox {...row.getToggleRowSelectedProps()} />
            </div>
          ),
        },
        ...columns,
      ]);
    }
  });

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    // rows,
    prepareRow,
    // getToggleHideAllColumnsProps,

    //@ts-ignore
    page, // Instead of using 'rows', we'll use page,
    // which has only the rows for the active page

    //@ts-ignore
    pageCount,
    //@ts-ignore
    gotoPage,

    //@ts-ignore
    state: { pageIndex, selectedRowIds },

    allColumns,
    visibleColumns,
  } = tableInstance;

  const TableCell = <T extends {}>({
    cell,
    styles,
  }: {
    cell: Cell<T>;
    styles: any;
  }) => {
    const cellProps = cell.getCellProps();
    return (
      <td {...cellProps}>
        {cell.render('Cell', {
          cellProps,
          tableStyles: styles,
        })}
      </td>
    );
  };

  const tableProps = getTableProps();
  return (
    <>
      <div>
        {canHideColumns && (
          <HorizontalGroup width="100%">
            <FilterPill
              selected={allColumns.length === visibleColumns.length}
              onClick={() => {
                if (visibleColumns.length === 0 || visibleColumns.length === allColumns.length) {
                  allColumns.forEach((c) => c.toggleHidden());
                } else {
                  allColumns.forEach((c) => c.toggleHidden(false));
                }
              }}
              label={'Toggle All'}
            />
            {allColumns.map((column) => {
              return (
                <div key={column.id}>
                  <label>
                    <FilterPill
                      selected={column.isVisible}
                      onClick={() => column.toggleHidden()}
                      // @ts-ignore
                      label={column.displayValue!.toString()}
                    />
                  </label>
                </div>
              );
            })}
          </HorizontalGroup>
        )}
      </div>
      <table {...tableProps} style={{ ...tableProps.style, width: '100%' }}>
        <HeaderRow headerGroups={headerGroups} />
        <tbody {...getTableBodyProps()}>
          {
            // Loop over the table rows
            (page as Array<Row<T>>).map((row) => {
              // Prepare the row for display
              prepareRow(row);
              return (
                // Apply the row props
                <tr {...row.getRowProps()} key={row.id}>
                  {
                    // Loop over the rows cells
                    row.cells.map((cell) => {
                      // Apply the cell props
                      return (
                        <TableCell
                          //@ts-ignore
                          key={cell.id}
                          cell={cell}
                          styles={tableStyles}
                        />
                      );
                    })
                  }
                </tr>
              );
            })
          }
        </tbody>
      </table>
      <Pagination
        currentPage={pageIndex + 1}
        numberOfPages={pageCount}
        onNavigate={(page) => gotoPage(page - 1)}
        hideWhenSinglePage
      />
    </>
  );
};

const CellComponent = (props: any) => {
  return (
    <div {...props.cellProps} className={props.tableStyles.cellContainer}>
      <div className={props.tableStyles.cellText}>{props.value}</div>
    </div>
  );
};
