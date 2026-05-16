import React, { useState } from 'react';
import StatusBadge from './StatusBadge';

interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T extends { id: number }> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  activeRowId?: number | null;
}

export default function DataTable<T extends { id: number }>({ columns, data, onRowClick, activeRowId }: DataTableProps<T>) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--color-ats-border)' }}>
            {columns.map(col => (
              <th key={col.key as string} style={{ textAlign: 'left', padding: '0.75rem 1rem', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-ats-muted)', whiteSpace: 'nowrap' }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map(row => (
            <tr
              key={row.id}
              onClick={() => onRowClick?.(row)}
              style={{
                borderBottom: '1px solid var(--color-ats-border)',
                cursor: onRowClick ? 'pointer' : 'default',
                backgroundColor: activeRowId === row.id ? 'rgba(59,130,246,0.08)' : 'transparent',
                transition: 'background-color 0.1s',
              }}
              onMouseEnter={e => { if (activeRowId !== row.id) (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-ats-surface)'; }}
              onMouseLeave={e => { if (activeRowId !== row.id) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
            >
              {columns.map(col => (
                <td key={col.key as string} style={{ padding: '0.875rem 1rem', color: 'var(--color-ats-text)', verticalAlign: 'middle' }}>
                  {col.render ? col.render(row) : String((row as any)[col.key] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {data.length === 0 && (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-ats-muted)', fontSize: '0.875rem' }}>
          No records found.
        </div>
      )}
    </div>
  );
}
