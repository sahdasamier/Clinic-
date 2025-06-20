import React from 'react';
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
} from '@mui/material';

interface ResponsiveTableProps {
  headers: Array<{
    key: string;
    label: string;
    align?: 'left' | 'center' | 'right';
    width?: string | number;
    mobileHide?: boolean; // Hide this column on mobile
  }>;
  data: Array<Record<string, React.ReactNode>>;
  mobileCardContent: (item: Record<string, React.ReactNode>, index: number) => React.ReactNode;
  tableProps?: any;
  cardProps?: any;
  onRowClick?: (item: Record<string, React.ReactNode>, index: number) => void;
}

const ResponsiveTable: React.FC<ResponsiveTableProps> = ({
  headers,
  data,
  mobileCardContent,
  tableProps = {},
  cardProps = {},
  onRowClick,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  if (isMobile) {
    // Mobile: Card layout
    return (
      <Stack spacing={2}>
        {data.map((item, index) => (
          <Card
            key={index}
            {...cardProps}
            sx={{
              cursor: onRowClick ? 'pointer' : 'default',
              transition: 'all 0.2s ease',
              '&:hover': onRowClick ? {
                transform: 'translateY(-2px)',
                boxShadow: theme.shadows[4],
              } : {},
              ...cardProps.sx,
            }}
            onClick={() => onRowClick?.(item, index)}
          >
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              {mobileCardContent(item, index)}
            </CardContent>
          </Card>
        ))}
      </Stack>
    );
  }

  // Desktop: Table layout
  return (
    <TableContainer {...tableProps}>
      <Table>
        <TableHead>
          <TableRow>
            {headers.map((header) => (
              <TableCell
                key={header.key}
                align={header.align || 'left'}
                sx={{
                  width: header.width,
                  fontWeight: 600,
                  backgroundColor: 'rgba(0, 0, 0, 0.02)',
                }}
              >
                {header.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((item, index) => (
            <TableRow
              key={index}
              hover={!!onRowClick}
              sx={{
                cursor: onRowClick ? 'pointer' : 'default',
                '&:hover': onRowClick ? {
                  backgroundColor: 'rgba(25, 118, 210, 0.04)',
                } : {},
              }}
              onClick={() => onRowClick?.(item, index)}
            >
              {headers.map((header) => (
                <TableCell key={header.key} align={header.align || 'left'}>
                  {item[header.key]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ResponsiveTable; 