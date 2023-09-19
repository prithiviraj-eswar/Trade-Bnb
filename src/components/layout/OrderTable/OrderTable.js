import * as React from 'react'
import { useState, useEffect } from 'react'
import '../../screens/NorthAmerica/NorthAmerica.css'
import { Line } from 'react-chartjs-2'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TablePagination from '@mui/material/TablePagination'
import TableRow from '@mui/material/TableRow'

/**
 * for data table
 */
const columns = [
  { id: 'id', label: 'Id', align: 'center', minWidth: 50, format: (value) => value.toLocaleString('en-US') },
  {
    id: 'Ticker',
    label: 'Ticker',
    minWidth: 120,
    align: 'left',
    format: (value) => value.toLocaleString('en-US'),
  },
  {
    id: 'Qty',
    label: 'Quantity',
    minWidth: 120,
    align: 'center',
    format: (value) => value.toLocaleString('en-US'),
  },
  {
    id: 'Price',
    label: 'Price Quote',
    minWidth: 120,
    align: 'center',
    format: (value) => value.toLocaleString('en-US'),
  },
  {
    id: 'orderType',
    label: 'Transaction Type',
    minWidth: 120,
    align: 'center',
    format: (value) => value.toLocaleString('en-US').slice(0, 10),
  },

  {
    id: 'orderStatus',
    label: 'Status',
    minWidth: 120,
    align: 'center',
    format: (value) => value.toLocaleString('en-US').slice(0, 10),
  },
  {
    id: 'dateTime',
    label: 'Date-Time',
    minWidth: 200,
    align: 'left',
    format: (value) => value.toLocaleString('en-US').slice(0, 10),
  },
]

function createData(id, Ticker, Qty, Price, orderType, orderStatus, dateTime) {
  return { id, Ticker, Qty, Price, orderType, orderStatus, dateTime }
}

export default function OrderTable({ orderData }) {
  //   const [orderDataRow, setOrderDataRow] = useState([])
  //   debugger
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  let rows = []
  let orderDataRow = []

  useEffect(() => {}, [])

  const mkt = (item) => ({
    method: 'GET',
    url: 'https://mboum-finance.p.rapidapi.com/hi/history',
    params: { symbol: item, interval: '5m', diffandsplits: 'false' },
    headers: {
      'X-RapidAPI-Host': 'mboum-finance.p.rapidapi.com',
      'X-RapidAPI-Key': '285ae9ae64mshb0023a8ab269acap1da29fjsn48034d41e0c7',
    },
  })

  if (orderData.length > 0) {
    // for (var i = 0; i < props.news[0].length; i++) {
    for (var i = 0; i < orderData.length; i++) {
      rows.push(
        createData(
          i + 1,
          orderData[i][0].Ticker,
          orderData[i][0].Qty,
          orderData[i][0].Price,
          orderData[i][0].orderType,
          orderData[i][0].orderStatus,
          orderData[i][0].orderDate
        )
      )
    }
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value)
    setPage(0)
  }

  return (
    <>
      <div className='Market_Data_Wrapper'>
        <div className='northAmerica'></div>
        <div className='market_content2'>
          <div className='NEWS'>
            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
              <TableContainer sx={{ maxHeight: 400 }}>
                <Table stickyHeader aria-label='sticky table'>
                  <TableHead>
                    <TableRow>
                      {columns.map((column) => (
                        <TableCell key={column.id} align={column.align} style={{ minWidth: column.minWidth }}>
                          {column.label}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                      return (
                        <TableRow hover role='checkbox' tabIndex={-1} key={row.code}>
                          {columns.map((column) => {
                            const value = row[column.id]
                            return (
                              <TableCell key={column.id} align={column.align}>
                                {column.format && typeof value === 'number' ? column.format(value) : value}
                              </TableCell>
                            )
                          })}
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[10, 25, 100]}
                component='div'
                count={rows.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </Paper>
          </div>
        </div>
        <div className='market_content3'>
          <div className='MarketStats'>
            {/* <img src='MarketStats.png' alt='alternate_text' width='100%' height='720px' /> */}
          </div>
        </div>
      </div>
    </>
  )
}
