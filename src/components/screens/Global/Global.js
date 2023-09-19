import * as React from 'react'
import { useState, useEffect } from 'react'
import axios from 'axios'
import dailyCACData from '../../DataIsland/dailyCACData.json'
import dailyDAXData from '../../DataIsland/dailyDAXData.json'
import dailyFTSEData from '../../DataIsland/dailyFTSEData.json'
// import globalMarketData from '../../DataIsland/globalMarketData.xml'
import XMLParser from 'react-xml-parser'
import convert from 'xml-js'
import './Global.css'
import { Line } from 'react-chartjs-2'
import MapChart from './MapChart'
import { globalDataJson } from '../../DataIsland/globalMarketData'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
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
    id: 'name',
    label: 'Exchange Name',
    minWidth: 100,
    align: 'left',
    format: (value) => value.toLocaleString('en-US'),
  },
  {
    id: 'currency',
    label: 'Currency',
    minWidth: 100,
    align: 'left',
    format: (value) => value.toLocaleString('en-US'),
  },
  {
    id: 'open',
    label: 'Open Price',
    minWidth: 100,
    align: 'left',
    format: (value) => value.toLocaleString('en-US'),
  },
  {
    id: 'high',
    label: 'Day High',
    minWidth: 100,
    align: 'left',
    format: (value) => value.toLocaleString('en-US'),
  },
  {
    id: 'low',
    label: 'Day Low',
    minWidth: 100,
    align: 'left',
    format: (value) => value.toLocaleString('en-US'),
  },
  {
    id: 'close',
    label: 'Day close',
    minWidth: 100,
    align: 'left',
    format: (value) => value.toLocaleString('en-US'),
  },

  {
    id: 'date',
    label: 'Published-Date',
    minWidth: 150,
    align: 'right',
    format: (value) => value.toLocaleString('en-US').slice(0, 10),
  },
]

const gainerCol = [
  {
    id: 'symbol',
    label: 'Symbol',
    minWidth: 70,
    align: 'left',
    format: (value) => value.toLocaleString('en-US'),
  },
  {
    id: 'name',
    label: 'Name',
    minWidth: 180,
    align: 'left',
    format: (value) => value.toLocaleString('en-US'),
  },
  {
    id: 'price',
    label: 'Price',
    minWidth: 100,
    align: 'left',
    format: (value) => value.toLocaleString('en-US'),
  },
  {
    id: 'change',
    label: 'Change',
    minWidth: 100,
    align: 'right',
    format: (value) => value.toLocaleString('en-US').slice(0, 10),
  },
  {
    id: 'changesPercentage',
    label: 'Price %',
    minWidth: 120,
    align: 'right',
    format: (value) => value.toFixed(2) + '%',
  },
]
const loserCol = [
  {
    id: 'symbol',
    label: 'Symbol',
    minWidth: 70,
    align: 'left',
    format: (value) => value.toLocaleString('en-US'),
  },
  {
    id: 'name',
    label: 'Name',
    minWidth: 180,
    align: 'left',
    format: (value) => value.toLocaleString('en-US'),
  },
  {
    id: 'price',
    label: 'Price',
    minWidth: 100,
    align: 'left',
    format: (value) => value.toLocaleString('en-US'),
  },
  {
    id: 'change',
    label: 'Change',
    minWidth: 100,
    align: 'right',
    format: (value) => value.toLocaleString('en-US').slice(0, 10),
  },
  {
    id: 'changesPercentage',
    label: 'Price %',
    minWidth: 120,
    align: 'right',
    format: (value) => value.toFixed(2) + '%',
  },
]

function createData(id, name, currency, open, high, low, close, date) {
  return { id, name, currency, open, high, low, close, date }
}

function createGainData(symbol, name, price, change, changesPercentage) {
  return { symbol, name, price, change, changesPercentage }
}

function createLoserData(symbol, name, price, change, changesPercentage) {
  return { symbol, name, price, change, changesPercentage }
}
/**
 *
 * for line chart
 */
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const options = {
  responsive: true,
  interaction: {
    mode: 'index',
    intersect: false,
  },
  stacked: false,
  plugins: {
    title: {
      display: true,
      text: '',
    },
  },
  scales: {
    yAxes: [
      {
        ticks: {
          beginAtZero: true,
        },
      },
    ],
  },
}

const dataMassaging = (res) => {
  debugger
  let data1 = []
  Object.keys(res.elements[0].elements).map((item) => {
    if (res.elements[0].elements[item].elements.length > 2) {
      if (
        res.elements[0].elements[item].name === 'SYMBOL_RESPONSE' &&
        res.elements[0].elements[item].elements[2].elements[10].elements[0].text !== 'DJ BRAZIL'
      ) {
        if (
          res.elements[0].elements[item].elements[2].elements[4].elements[0].text !== 0 &&
          res.elements[0].elements[item].elements[2].elements[5].elements[0].text !== 0 &&
          res.elements[0].elements[item].elements[2].elements[9].elements[0].text !== 0 &&
          res.elements[0].elements[item].elements[2].elements[14].elements[0].text !== 0
        ) {
          console.log('item', item)
          console.log('name', res.elements[0].elements[item].elements[2].elements[10].elements[0].text)
          console.log('open', res.elements[0].elements[item].elements[2].elements[14].elements[0].text)
          console.log('high', res.elements[0].elements[item].elements[2].elements[4].elements[0].text)
          console.log('low', res.elements[0].elements[item].elements[2].elements[5].elements[0].text)
          console.log('close', res.elements[0].elements[item].elements[2].elements[9].elements[0].text)

          console.log('date', res.elements[0].elements[item].elements[2].elements[7].elements[0].text)
          console.log('currency', res.elements[0].elements[item].elements[2].elements[3].elements[0].text)
          data1.push({
            date: res.elements[0].elements[item].elements[2].elements[7].elements[0].text,
            open: Math.round(
              (res.elements[0].elements[item].elements[2].elements[14].elements[0].text * 100) / 100
            ).toFixed(2),
            high: Math.round(
              (res.elements[0].elements[item].elements[2].elements[4].elements[0].text * 100) / 100
            ).toFixed(2),
            low: Math.round(
              (res.elements[0].elements[item].elements[2].elements[5].elements[0].text * 100) / 100
            ).toFixed(2),
            close: Math.round(
              (res.elements[0].elements[item].elements[2].elements[9].elements[0].text * 100) / 100
            ).toFixed(2),

            name: res.elements[0].elements[item].elements[2].elements[10].elements[0].text,
            currency: res.elements[0].elements[item].elements[2].elements[3].elements[0].text,
          })
        }
      }
    }
  })

  return data1
}

/**
 *
 * for candlestick
 */

export default function Global() {
  //props.dailyIXIC[0].items
  //props.dailyDJA[0].items
  //props.dailyIXIC[0].items
  const [globalData, setGlobalData] = useState([])
  const [getNewsData, setNEWSData] = useState([])
  const [gainersDailyData, setGainers] = useState([])
  const [earningsDailyData, setEarnings] = useState([])
  const [trendingDailyData, setTrending] = useState([])
  const indices = ['CAC', 'DAX', 'LDNXF']
  const region = ['GB', 'FR', 'DE']
  const [chartDataState, setChartdataState] = useState([])
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [gainPage, setGainPage] = useState(0)
  const [gainRowsPerPage, setGainRowsPerPage] = useState(10)
  const [losePage, setLosePage] = useState(0)
  const [loseRowsPerPage, setLoseRowsPerPage] = useState(10)

  let rows = []
  let gainRows = []
  let loseRows = []

  let dataFormationGlobal,
    globalDataObject = null
  let candleData = null

  useEffect(() => {
    // const getGlobalData = async () => {
    //   // event.preventDefault()
    //   // alert(`the ticker you entered is:  ${ticker}`)
    //   try {
    //     // debugger
    //     await axios.request(mkt).then((response) => {
    //       const res = response.data
    //       setGlobalData((prevData) => [...prevData, res])
    //     })
    //   } catch (error) {
    //     console.error(error)
    //   }
    // }
    // const getDAGData = async () => {
    //   // event.preventDefault()
    //   // alert(`the ticker you entered is:  ${ticker}`)
    //   try {
    //     debugger
    //     await axios.request(mkt(indices[0])).then((response) => {
    //       const resDAG = response.data
    //       setDAGData((prevData) => [...prevData, resDAG])
    //       console.log('DAGdata', DAGData)
    //     })
    //   } catch (error) {
    //     console.error(error)
    //   }
    // }
    // const getFTSEData = async () => {
    //   // event.preventDefault()
    //   // alert(`the ticker you entered is:  ${ticker}`)
    //   try {
    //     debugger
    //     await axios.request(mkt(indices[1])).then((response) => {
    //       const resFTSE = response.data
    //       setFTSEData((prevData) => [...prevData, resFTSE])
    //       console.log('FTSEdata', FTSEData)
    //     })
    //   } catch (error) {
    //     console.error(error)
    //   }
    // }
    // const getNews = async () => {
    //   // event.preventDefault()
    //   // alert(`the ticker you entered is:  ${ticker}`)
    //   try {
    //     debugger
    //     await axios.request(news).then((response) => {
    //       const resNEWS = response.data.data.main.stream
    //       setNEWSData((prevData) => [...prevData, resNEWS])
    //       console.log('News data', getNewsData)
    //     })
    //   } catch (error) {
    //     console.error(error)
    //   }
    // }
    // const getGainers = async () => {
    //   // event.preventDefault()
    //   // alert(`the ticker you entered is:  ${ticker}`)
    //   try {
    //     debugger
    //     await axios.get(gainers).then((response) => {
    //       console.log('gainers', response)
    //       const resGainers = response.data
    //       setGainers((prevData) => [...prevData, resGainers])
    //       console.log('gainer  data', gainersDailyData)
    //     })
    //   } catch (error) {
    //     console.error(error)
    //   }
    // }
    // const getEarnings = async () => {
    //   // event.preventDefault()
    //   // alert(`the ticker you entered is:  ${ticker}`)
    //   try {
    //     debugger
    //     await axios.get(earnings).then((response) => {
    //       console.log('earnings', response)
    //       const resEarnings = response.data
    //       setEarnings((prevData) => [...prevData, resEarnings])
    //       console.log('earnings data', earningsDailyData)
    //     })
    //   } catch (error) {
    //     console.error(error)
    //   }
    // }
    // const getTrending = async () => {
    //   // event.preventDefault()
    //   // alert(`the ticker you entered is:  ${ticker}`)
    //   try {
    //     debugger
    //     await axios.get(trending).then((response) => {
    //       console.log('trending', response)
    //       const resTrending = response.data
    //       setTrending((prevData) => [...prevData, resTrending])
    //       console.log('trending data', trendingDailyData)
    //     })
    //   } catch (error) {
    //     console.error(error)
    //   }
    // }
    // getCACData()
    // getDAGData()
    // getFTSEData()
    // getNews()
    // getGainers()
    // getEarnings()
    // getTrending()
    // getGlobalData()
  }, [globalData])

  const mkt = {
    method: 'GET',
    url: 'https://fidelity-investments.p.rapidapi.com/market/get-international',
    headers: {
      'X-RapidAPI-Host': 'fidelity-investments.p.rapidapi.com',
      'X-RapidAPI-Key': '285ae9ae64mshb0023a8ab269acap1da29fjsn48034d41e0c7',
    },
  }

  const news = {
    method: 'POST',
    url: 'https://yh-finance.p.rapidapi.com/news/v2/list',
    params: { region: 'GB', snippetCount: '28' },
    headers: {
      'content-type': 'text/plain',
      'X-RapidAPI-Host': 'yh-finance.p.rapidapi.com',
      'X-RapidAPI-Key': '285ae9ae64mshb0023a8ab269acap1da29fjsn48034d41e0c7',
    },
    data: '',
  }

  const gainers = {
    method: 'GET',
    url: 'https://yh-finance.p.rapidapi.com/market/v2/get-movers',
    params: { region: 'GB', lang: 'en-US', count: '20', start: '0' },
    headers: {
      'X-RapidAPI-Host': 'yh-finance.p.rapidapi.com',
      'X-RapidAPI-Key': '285ae9ae64mshb0023a8ab269acap1da29fjsn48034d41e0c7',
    },
  }

  const earnings = {
    method: 'GET',
    url: 'https://yh-finance.p.rapidapi.com/market/get-earnings',
    params: { region: 'GB', startDate: '1585155600000', endDate: '1589475600000', size: '10' },
    headers: {
      'X-RapidAPI-Host': 'yh-finance.p.rapidapi.com',
      'X-RapidAPI-Key': '285ae9ae64mshb0023a8ab269acap1da29fjsn48034d41e0c7',
    },
  }

  const trending = {
    method: 'GET',
    url: 'https://yh-finance.p.rapidapi.com/market/get-trending-tickers',
    params: { region: 'GB' },
    headers: {
      'X-RapidAPI-Host': 'yh-finance.p.rapidapi.com',
      'X-RapidAPI-Key': '285ae9ae64mshb0023a8ab269acap1da29fjsn48034d41e0c7',
    },
  }

  if (globalData.length > 0) {
    // debugger
    // console.log('json', convert.xml2js(globalData))
    // console.log('js', convert.xml2json(globalData))
    // dataFormationGlobal = convert.xml2js(globalData)
    // globalDataObject = dataFormationGlobal && dataMassaging(dataFormationGlobal)
  }

  if (globalDataJson && globalDataJson.length > 0) {
    // debugger

    // for (var i = 0; i < props.news[0].length; i++) {
    for (var i = 0; i < globalDataJson.length; i++) {
      rows.push(
        createData(
          i + 1,
          globalDataJson[i].name,
          globalDataJson[i].currency,
          globalDataJson[i].open,
          globalDataJson[i].high,
          globalDataJson[i].low,
          globalDataJson[i].close,
          globalDataJson[i].date
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

  const handleGainChangePage = (event, newPage) => {
    setGainPage(newPage)
  }

  const handleGainChangeRowsPerPage = (event) => {
    setGainRowsPerPage(+event.target.value)
    setGainPage(0)
  }
  const handleLoseChangePage = (event, newPage) => {
    setLosePage(newPage)
  }

  const handleLoseChangeRowsPerPage = (event) => {
    setLoseRowsPerPage(+event.target.value)
    setLosePage(0)
  }
  console.log('columns', columns)
  console.log('rows', rows)
  return (
    <>
      <div className='Market_Data_Wrapper'>
        <div className='europeHeader'>
          <h3>Global Data Live...</h3>
        </div>

        <div className='market_content0'>
          {/* <div className='Line_SPY'>
            <Line data={dataSPY} options={options} />
          </div>
          <div className='Line_DJA'>
            <Line data={dataDJA} options={options} />
          </div>
          <div className='Line_IXIC'>
            <Line data={dataIXIC} options={options} />
          </div> */}
          <div className='Map_Global'>
            <MapChart />
          </div>
        </div>
        <div className='market_content1'>
          {/* <div className='gainers'>
            <Paper sx={{ width: '700', overflow: 'hidden' }}>
              <h3>Top Gainers:</h3>
              <TableContainer sx={{ maxHeight: 300 }}>
                <Table stickyHeader aria-label='sticky table' className='gainer_table'>
                  <TableHead>
                    <TableRow>
                      {gainerCol.map((column) => (
                        <TableCell key={column.id} align={column.align} style={{ minWidth: column.minWidth }}>
                          {column.label}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {gainRows
                      .slice(gainPage * gainRowsPerPage, gainPage * gainRowsPerPage + gainRowsPerPage)
                      .map((row) => {
                        return (
                          <TableRow hover role='checkbox' tabIndex={-1} key={row.code}>
                            {gainerCol.map((column) => {
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
                count={gainRows.length}
                rowsPerPage={gainRowsPerPage}
                page={gainPage}
                onPageChange={handleGainChangePage}
                onRowsPerPageChange={handleGainChangeRowsPerPage}
              />
            </Paper>
          </div>
          <div className='losers'>
            <Paper sx={{ width: '700', overflow: 'hidden' }}>
              <h3>Top Losers:</h3>
              <TableContainer sx={{ maxHeight: 300 }}>
                <Table stickyHeader aria-label='sticky table' className='loser_table'>
                  <TableHead>
                    <TableRow>
                      {loserCol.map((column) => (
                        <TableCell key={column.id} align={column.align} style={{ minWidth: column.minWidth }}>
                          {column.label}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loseRows
                      .slice(losePage * loseRowsPerPage, losePage * loseRowsPerPage + loseRowsPerPage)
                      .map((row) => {
                        return (
                          <TableRow hover role='checkbox' tabIndex={-1} key={row.code}>
                            {loserCol.map((column) => {
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
                count={gainRows.length}
                rowsPerPage={loseRowsPerPage}
                page={losePage}
                onPageChange={handleLoseChangePage}
                onRowsPerPageChange={handleLoseChangeRowsPerPage}
              />
            </Paper>
          </div> */}
        </div>
        <div className='market_content2'>
          <div className='Global_Indices'>
            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
              <h3>&nbsp;&nbsp;&nbsp;Global Indices:</h3>
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
                rowsPerPageOptions={[10, 25]}
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
