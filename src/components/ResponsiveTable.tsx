import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
  useMediaQuery,
  Stack,
  Divider,
  IconButton,
  Tooltip,
  Chip,
  Grid,
} from '@mui/material';
import { ViewList, ViewModule, Sort } from '@mui/icons-material';

interface Column {
  id: string;
  label: string;
  minWidth?: number;
  align?: 'right' | 'left' | 'center';
  format?: (value: any) => string | React.ReactNode;
  sortable?: boolean;
  hideOnMobile?: boolean;
}

interface ResponsiveTableProps {
  columns: Column[];
  rows: any[];
  onRowClick?: (row: any) => void;
  stickyHeader?: boolean;
  maxHeight?: number | string;
  emptyMessage?: string;
  loading?: boolean;
  showViewToggle?: boolean;
  defaultView?: 'table' | 'cards';
}

const ResponsiveTable: React.FC<ResponsiveTableProps> = ({
  columns,
  rows,
  onRowClick,
  stickyHeader = true,
  maxHeight = 600,
  emptyMessage = 'No data available',
  loading = false,
  showViewToggle = true,
  defaultView = 'table'
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  
  const [viewMode, setViewMode] = useState<'table' | 'cards'>(defaultView);
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Auto-switch to card view on mobile
  useEffect(() => {
    if (isMobile && viewMode === 'table') {
      setViewMode('cards');
    }
  }, [isMobile, viewMode]);

  const handleSort = (columnId: string) => {
    if (sortColumn === columnId) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnId);
      setSortDirection('asc');
    }
  };

  const sortedRows = React.useMemo(() => {
    if (!sortColumn) return rows;
    
    return [...rows].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [rows, sortColumn, sortDirection]);

  const filteredColumns = isMobile 
    ? columns.filter(col => !col.hideOnMobile)
    : columns;

  const LoadingSkeleton = () => (
    <>
      {[...Array(5)].map((_, index) => (
        <TableRow key={index}>
          {filteredColumns.map((column) => (
            <TableCell key={column.id}>
              <div className="loading-skeleton h-4 rounded"></div>
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );

  const CardView = () => (
    <Grid container spacing={2}>
      {sortedRows.map((row, index) => (
        <Grid item xs={12} sm={6} lg={4} key={index}>
          <Card 
            className="card-responsive cursor-pointer transform transition-transform hover:scale-[1.02]"
            onClick={() => onRowClick?.(row)}
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              '&:hover': {
                boxShadow: theme.shadows[4],
              }
            }}
          >
            <CardContent sx={{ flexGrow: 1, p: { xs: 2, sm: 3 } }}>
              {columns.map((column, colIndex) => {
                const value = row[column.id];
                const formattedValue = column.format ? column.format(value) : value;
                
                return (
                  <Box key={column.id} sx={{ mb: colIndex === columns.length - 1 ? 0 : 1.5 }}>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: 'text.secondary',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                        fontSize: '0.7rem'
                      }}
                    >
                      {column.label}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        mt: 0.5,
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                        fontWeight: colIndex === 0 ? 600 : 400
                      }}
                    >
                      {formattedValue}
                    </Typography>
                  </Box>
                );
              })}
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const TableView = () => (
    <TableContainer 
      component={Paper} 
      sx={{ 
        maxHeight,
        overflowX: 'auto',
        '&::-webkit-scrollbar': {
          height: '8px',
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: '#f1f1f1',
          borderRadius: '4px',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: '#c1c1c1',
          borderRadius: '4px',
          '&:hover': {
            backgroundColor: '#a8a8a8',
          },
        },
      }}
    >
      <Table stickyHeader={stickyHeader} sx={{ minWidth: 650 }}>
        <TableHead>
          <TableRow>
            {filteredColumns.map((column) => (
              <TableCell
                key={column.id}
                align={column.align}
                sx={{
                  minWidth: column.minWidth,
                  fontWeight: 600,
                  backgroundColor: 'background.default',
                  fontSize: { xs: '0.8rem', sm: '0.875rem' },
                  padding: { xs: '8px 4px', sm: '16px' },
                  cursor: column.sortable ? 'pointer' : 'default',
                  '&:hover': column.sortable && {
                    backgroundColor: 'action.hover',
                  },
                }}
                onClick={() => column.sortable && handleSort(column.id)}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {column.label}
                  {column.sortable && (
                    <Sort 
                      sx={{ 
                        fontSize: '1rem',
                        opacity: sortColumn === column.id ? 1 : 0.5,
                        transform: sortColumn === column.id && sortDirection === 'desc' 
                          ? 'rotate(180deg)' : 'none',
                        transition: 'all 0.2s ease',
                      }} 
                    />
                  )}
                </Box>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            <LoadingSkeleton />
          ) : sortedRows.length === 0 ? (
            <TableRow>
              <TableCell 
                colSpan={filteredColumns.length} 
                align="center"
                sx={{ py: 6 }}
              >
                <Typography variant="body1" color="text.secondary">
                  {emptyMessage}
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            sortedRows.map((row, index) => (
              <TableRow
                hover
                key={index}
                onClick={() => onRowClick?.(row)}
                sx={{
                  cursor: onRowClick ? 'pointer' : 'default',
                  '&:hover': onRowClick && {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                {filteredColumns.map((column) => {
                  const value = row[column.id];
                  const formattedValue = column.format ? column.format(value) : value;
                  
                  return (
                    <TableCell 
                      key={column.id} 
                      align={column.align}
                      sx={{
                        fontSize: { xs: '0.8rem', sm: '0.875rem' },
                        padding: { xs: '8px 4px', sm: '16px' },
                      }}
                    >
                      {formattedValue}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Box sx={{ width: '100%' }}>
      {/* View Toggle */}
      {showViewToggle && !isMobile && (
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Box sx={{ display: 'flex', border: 1, borderColor: 'divider', borderRadius: 1 }}>
            <Tooltip title="Table View">
              <IconButton
                size="small"
                onClick={() => setViewMode('table')}
                sx={{
                  backgroundColor: viewMode === 'table' ? 'primary.main' : 'transparent',
                  color: viewMode === 'table' ? 'white' : 'text.primary',
                  borderRadius: '4px 0 0 4px',
                  '&:hover': {
                    backgroundColor: viewMode === 'table' ? 'primary.dark' : 'action.hover',
                  },
                }}
              >
                <ViewList />
              </IconButton>
            </Tooltip>
            <Tooltip title="Card View">
              <IconButton
                size="small"
                onClick={() => setViewMode('cards')}
                sx={{
                  backgroundColor: viewMode === 'cards' ? 'primary.main' : 'transparent',
                  color: viewMode === 'cards' ? 'white' : 'text.primary',
                  borderRadius: '0 4px 4px 0',
                  '&:hover': {
                    backgroundColor: viewMode === 'cards' ? 'primary.dark' : 'action.hover',
                  },
                }}
              >
                <ViewModule />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      )}

      {/* Data Count */}
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Chip 
          label={`${sortedRows.length} ${sortedRows.length === 1 ? 'item' : 'items'}`}
          size="small"
          variant="outlined"
        />
        {sortColumn && (
          <Chip
            label={`Sorted by ${columns.find(col => col.id === sortColumn)?.label} (${sortDirection})`}
            size="small"
            onDelete={() => setSortColumn('')}
          />
        )}
      </Box>

      {/* Content */}
      {viewMode === 'cards' || isMobile ? <CardView /> : <TableView />}
    </Box>
  );
};

export default ResponsiveTable; 