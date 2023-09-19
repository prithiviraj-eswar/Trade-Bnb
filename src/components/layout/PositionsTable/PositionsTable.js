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
  {
    id: 'Ticker',
    label: 'Ticker',
    minWidth: 100,
    align: 'left',
    format: (value) => value.toLocaleString('en-US'),
  },
  {
    id: 'Qty',
    label: 'Quantity',
    minWidth: 100,
    align: 'center',
    format: (value) => value.toLocaleString('en-US'),
  },
  {
    id: 'Previous',
    label: 'Previous Close',
    minWidth: 100,
    align: 'center',
    format: (value) => value.toLocaleString('en-US'),
  },
  {
    id: 'ltp',
    label: 'LTP',
    minWidth: 100,
    align: 'center',
    format: (value) => value.toLocaleString('en-US').slice(0, 10),
  },
  {
    id: 'pnl',
    label: 'PnL',
    minWidth: 100,
    align: 'center',
    format: (value) => value.toLocaleString('en-US').slice(0, 10),
  },
  {
    id: 'volume',
    label: 'Volume',
    minWidth: 100,
    align: 'center',
    format: (value) => value.toLocaleString('en-US').slice(0, 10),
  },
  {
    id: 'dateTime',
    label: 'Last Trading Day',
    minWidth: 200,
    align: 'left',
    format: (value) => value.toLocaleString('en-US').slice(0, 10),
  },
]

function createData(Ticker, Qty, Previous, ltp, pnl, volume, dateTime) {
  return { Ticker, Qty, Previous, ltp, pnl, volume, dateTime }
}

export default function PositionsTable({ orderData, tickerDataCurrPriceList }) {
  //   const [orderDataRow, setOrderDataRow] = useState([])
  //debugger
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  let rows = []
  let orderDataRow = []
  debugger
  useEffect(() => {}, [])

  if (orderData.length > 0) {
    // for (var i = 0; i < props.news[0].length; i++) {
    for (var i = 0; i < orderData.length; i++) {
      let filterData = tickerDataCurrPriceList.filter((item) => item['01. symbol'] === orderData[i][0].Ticker)
      rows.push(
        createData(
          orderData[i][0].Ticker,
          orderData[i][0].Qty,
          filterData[0]['08. previous close'],
          filterData[0]['05. price'],
          (filterData[0]['05. price'] - orderData[i][0].Price) * orderData[i][0].Qty,
          filterData[0]['06. volume'],
          filterData[0]['07. latest trading day']
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
