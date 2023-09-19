import * as React from 'react'
import { useState, useEffect } from 'react'
import axios from 'axios'
import dailyIXICData from '../../DataIsland/dailyIXICData.json'
import dailyDJAData from '../../DataIsland/dailyDJAData.json'
import dailySPYData from '../../DataIsland/dailySPYData.json'
import newsData from '../../DataIsland/newsData.json'
import tickerData from '../../DataIsland/tickerdata.json'
import gainersData from '../../DataIsland/gainersData.json'
import losersData from '../../DataIsland/losersData.json'
import activeData from '../../DataIsland/activeData.json'
import './NorthAmerica.css'
import { Line } from 'react-chartjs-2'
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
    id: 'sourceName',
    label: 'Source Name',
    minWidth: 100,
    align: 'left',
    format: (value) => value.toLocaleString('en-US'),
  },
  {
    id: 'providerName',
    label: 'Provider Name',
    minWidth: 100,
    align: 'left',
    format: (value) => value.toLocaleString('en-US'),
  },
  {
    id: 'title',
    label: 'Headline',
    minWidth: 270,
    align: 'left',
    format: (value) => value.toLocaleString('en-US'),
  },
  {
    id: 'publishedDate',
    label: 'Published-Date',
    minWidth: 170,
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

function createData(id, sourceName, providerName, title, publishedDate) {
  return { id, sourceName, providerName, title, publishedDate }
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
  let data1 = []
  Object.keys(res).map((item) => {
    data1.push({
      date: res[item]['date'],
      open: Math.round((res[item]['open'] * 100) / 100).toFixed(2),
      high: Math.round((res[item]['high'] * 100) / 100).toFixed(2),
      low: Math.round((res[item]['low'] * 100) / 100).toFixed(2),
      close: Math.round((res[item]['close'] * 100) / 100).toFixed(2),
      vol: Math.round((res[item]['volume'] * 100) / 100).toFixed(2),
    })
  })

  return data1
}

/**
 *
 * for candlestick
 */

export default function NorthAmerica() {
  //props.dailyIXIC[0].items
  //props.dailyDJA[0].items
  //props.dailyIXIC[0].items
  const [NASDAQData, setNASDAQData] = useState([])
  const [SPYData, setSPYData] = useState([])
  const [DJAData, setDJAData] = useState([])
  const [getNewsData, setNEWSData] = useState([])
  const [gainersDailyData, setGainers] = useState([])
  const [losersDailyData, setLosers] = useState([])
  const [activeDailyData, setActive] = useState([])
  const indices = ['DIA', 'SPY', '^IXIC']
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

  let dataFormationDJA,
    dataFormationIXIC,
    dataFormationSPY = null
  let candleData = null

  useEffect(() => {
    //   const getIXICData = async () => {
    //     // event.preventDefault()
    //     // alert(`the ticker you entered is:  ${ticker}`)
    //     try {
    //       debugger
    //       await axios.request(mkt(indices[2])).then((response) => {
    //         const resNASDAQ = response.data
    //         setNASDAQData((prevData) => [...prevData, resNASDAQ])
    //         console.log('NASDAQData', NASDAQData)
    //       })
    //     } catch (error) {
    //       console.error(error)
    //     }
    //   }
    //   const getDJAData = async () => {
    //     // event.preventDefault()
    //     // alert(`the ticker you entered is:  ${ticker}`)
    //     try {
    //       debugger
    //       await axios.request(mkt(indices[0])).then((response) => {
    //         const resDJA = response.data
    //         setDJAData((prevData) => [...prevData, resDJA])
    //         console.log('DJAData', DJAData)
    //       })
    //     } catch (error) {
    //       console.error(error)
    //     }
    //   }
    //   const getSPYData = async () => {
    //     // event.preventDefault()
    //     // alert(`the ticker you entered is:  ${ticker}`)
    //     try {
    //       debugger
    //       await axios.request(mkt(indices[1])).then((response) => {
    //         const resSPY = response.data
    //         setSPYData((prevData) => [...prevData, resSPY])
    //         console.log('SPYData', SPYData)
    //       })
    //     } catch (error) {
    //       console.error(error)
    //     }
    //   }
    //   const getNews = async () => {
    //     // event.preventDefault()
    //     // alert(`the ticker you entered is:  ${ticker}`)
    //     try {
    //       debugger
    //       await axios.request(news).then((response) => {
    //         const resNEWS = response.data
    //         setNEWSData((prevData) => [...prevData, resNEWS])
    //         console.log('News data', getNewsData)
    //       })
    //     } catch (error) {
    //       console.error(error)
    //     }
    //   }
    //   const getGainers = async () => {
    //     // event.preventDefault()
    //     // alert(`the ticker you entered is:  ${ticker}`)
    //     try {
    //       debugger
    //       await axios.get(gainers.path).then((response) => {
    //         console.log('gainers', response)
    //         const resGainers = response.data
    //         setGainers((prevData) => [...prevData, resGainers])
    //         console.log('gainer  data', gainersData)
    //       })
    //     } catch (error) {
    //       console.error(error)
    //     }
    //   }
    //   const getLosers = async () => {
    //     // event.preventDefault()
    //     // alert(`the ticker you entered is:  ${ticker}`)
    //     try {
    //       debugger
    //       await axios.get(losers.path).then((response) => {
    //         console.log('losers', response)
    //         const resLosers = response.data
    //         setLosers((prevData) => [...prevData, resLosers])
    //         console.log('loser data', losersData)
    //       })
    //     } catch (error) {
    //       console.error(error)
    //     }
    //   }
    //   const getActive = async () => {
    //     // event.preventDefault()
    //     // alert(`the ticker you entered is:  ${ticker}`)
    //     try {
    //       debugger
    //       await axios.get(active.path).then((response) => {
    //         console.log('active', response)
    //         const resActive = response.data
    //         setActive((prevData) => [...prevData, resActive])
    //         console.log('active data', activeData)
    //       })
    //     } catch (error) {
    //       console.error(error)
    //     }
    //   }
    //   getIXICData()
    //   getDJAData()
    //   getSPYData()
    //   getNews()
    //   getGainers()
    //   getLosers()
    //   getActive()
  }, [])

  const mkt = (item) => ({
    method: 'GET',
    url: 'https://mboum-finance.p.rapidapi.com/hi/history',
    params: { symbol: item, interval: '5m', diffandsplits: 'false' },
    headers: {
      'X-RapidAPI-Host': 'mboum-finance.p.rapidapi.com',
      'X-RapidAPI-Key': '285ae9ae64mshb0023a8ab269acap1da29fjsn48034d41e0c7',
    },
  })

  const news = {
    method: 'GET',
    url: 'https://ms-finance.p.rapidapi.com/news/list',
    params: { performanceId: '0P0000OQN8' },
    headers: {
      'X-RapidAPI-Host': 'ms-finance.p.rapidapi.com',
      'X-RapidAPI-Key': '285ae9ae64mshb0023a8ab269acap1da29fjsn48034d41e0c7',
    },
  }

  const gainers = {
    hostname: 'financialmodelingprep.com',
    path: 'https://financialmodelingprep.com/api/v3/stock_market/gainers?apikey=d162ada81bab43bf88cd7386f26b5b60',
    method: 'GET',
  }

  const losers = {
    hostname: 'financialmodelingprep.com',
    path: 'https://financialmodelingprep.com/api/v3/stock_market/losers?apikey=d162ada81bab43bf88cd7386f26b5b60',
    method: 'GET',
  }

  const active = {
    hostname: 'financialmodelingprep.com',
    port: 443,
    path: 'https://financialmodelingprep.com/api/v3/stock_market/actives?apikey=d162ada81bab43bf88cd7386f26b5b60',
    method: 'GET',
  }
  if (dailyDJAData && dailyIXICData && dailySPYData) {
    dataFormationDJA = dailyDJAData && dataMassaging(dailyDJAData)
    dataFormationIXIC = dailyIXICData && dataMassaging(dailyIXICData)
    dataFormationSPY = dailySPYData && dataMassaging(dailySPYData)

    // candleData = props.data && buildCandleData(props.data[0]['Time Series (Daily)'])
    // setChartdataState((prevChartData) => [...prevChartData, dataFormation])
  }

  const dataSPY = {
    labels: dataFormationSPY && dataFormationSPY.length > 0 ? dataFormationSPY.map((items) => items.date) : '',
    datasets: [
      {
        label: 'SPY',
        data: dataFormationSPY && dataFormationSPY.length > 0 ? dataFormationSPY.map((items) => items.close) : '',
        fill: false,
        borderColor: '#4bc0c0',
      },
    ],
  }
  const dataDJA = {
    labels: dataFormationDJA && dataFormationDJA.length > 0 ? dataFormationDJA.map((items) => items.date) : '',
    datasets: [
      {
        label: 'DJ',
        data: dataFormationDJA && dataFormationDJA.length > 0 ? dataFormationDJA.map((items) => items.close) : '',
        fill: false,
        borderColor: '#741b47',
      },
    ],
  }

  const dataIXIC = {
    labels: dataFormationIXIC && dataFormationIXIC.length > 0 ? dataFormationIXIC.map((items) => items.date) : '',
    datasets: [
      {
        label: 'IXIC',
        data: dataFormationIXIC && dataFormationIXIC.length > 0 ? dataFormationIXIC.map((items) => items.close) : '',
        fill: false,
        borderColor: '#f6b26b',
      },
    ],
  }

  if (newsData.length > 0) {
    // for (var i = 0; i < props.news[0].length; i++) {
    for (var i = 0; i < newsData.length; i++) {
      rows.push(
        createData(
          i + 1,
          // props.news[0][i].sourceName,
          // props.news[0][i].providerName,
          // props.news[0][i].title,
          // props.news[0][i].publishedDate
          newsData[i].sourceName,
          newsData[i].providerName,
          newsData[i].title,
          newsData[i].publishedDate
        )
      )
    }
  }

  if (gainersData.length > 0) {
    // for (var i = 0; i < props.news[0].length; i++) {
    for (var i = 0; i < gainersData.length; i++) {
      gainRows.push(
        createGainData(
          // props.news[0][i].sourceName,
          // props.news[0][i].providerName,
          // props.news[0][i].title,
          // props.news[0][i].publishedDate
          gainersData[i].symbol,
          gainersData[i].name,
          gainersData[i].price,
          gainersData[i].change,
          gainersData[i].changesPercentage
        )
      )
    }
  }

  if (losersData.length > 0) {
    // for (var i = 0; i < props.news[0].length; i++) {
    for (var i = 0; i < losersData.length; i++) {
      loseRows.push(
        createLoserData(
          // props.news[0][i].sourceName,
          // props.news[0][i].providerName,
          // props.news[0][i].title,
          // props.news[0][i].publishedDate
          losersData[i].symbol,
          losersData[i].name,
          losersData[i].price,
          losersData[i].change,
          losersData[i].changesPercentage
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

  return (
    <>
      <div className='Market_Data_Wrapper'>
        <div className='northAmerica'>
          <h3>North America Data Live...</h3>
        </div>
        <div className='market_content0'>
          <div className='Line_SPY'>
            <Line data={dataSPY} options={options} />
          </div>
          <div className='Line_DJA'>
            <Line data={dataDJA} options={options} />
          </div>
          <div className='Line_IXIC'>
            <Line data={dataIXIC} options={options} />
          </div>
        </div>
        <div className='market_content1'>
          <div className='gainers'>
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
          </div>
        </div>
        <div className='market_content2'>
          <div className='NEWS'>
            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
              <h3>News:</h3>
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
