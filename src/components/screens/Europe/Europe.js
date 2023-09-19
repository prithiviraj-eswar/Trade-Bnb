import * as React from 'react'
import { useState, useEffect } from 'react'
import axios from 'axios'
import dailyCACData from '../../DataIsland/dailyCACData.json'
import dailyDAXData from '../../DataIsland/dailyDAXData.json'
import dailyFTSEData from '../../DataIsland/dailyFTSEData.json'
import { europeNewsData } from '../../DataIsland/europeNewsData'
import './Europe.css'
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
    if (
      res[item]['open'] !== 0 &&
      res[item]['high'] !== 0 &&
      res[item]['low'] !== 0 &&
      res[item]['close'] !== 0 &&
      res[item]['volume'] !== 0
    ) {
      data1.push({
        date: res[item]['date'],
        open: Math.round((res[item]['open'] * 100) / 100).toFixed(2),
        high: Math.round((res[item]['high'] * 100) / 100).toFixed(2),
        low: Math.round((res[item]['low'] * 100) / 100).toFixed(2),
        close: Math.round((res[item]['close'] * 100) / 100).toFixed(2),
        vol: Math.round((res[item]['volume'] * 100) / 100).toFixed(2),
      })
    }
  })

  return data1
}

/**
 *
 * for candlestick
 */

export default function Europe() {
  //props.dailyIXIC[0].items
  //props.dailyDJA[0].items
  //props.dailyIXIC[0].items
  const [CACData, setCACData] = useState([])
  const [DAGData, setDAGData] = useState([])
  const [FTSEData, setFTSEData] = useState([])
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
  console.log('news data', europeNewsData)
  let rows = []
  let gainRows = []
  let loseRows = []

  let dataFormationCAC,
    dataFormationDAX,
    dataFormationFTSE = null
  let candleData = null

  useEffect(() => {
    // const getCACData = async () => {
    //   // event.preventDefault()
    //   // alert(`the ticker you entered is:  ${ticker}`)
    //   try {
    //     debugger
    //     await axios.request(mkt(indices[2])).then((response) => {
    //       const resCAC = response.data
    //       setCACData((prevData) => [...prevData, resCAC])
    //       console.log('CACData', CACData)
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
    const getNews = async () => {
      // event.preventDefault()
      // alert(`the ticker you entered is:  ${ticker}`)
      try {
        // debugger
        await axios.request(news).then((response) => {
          const resNEWS = response.data.data.main.stream
          setNEWSData((prevData) => [...prevData, resNEWS])
          console.log('News data', getNewsData)
        })
      } catch (error) {
        console.error(error)
      }
    }
    const getGainers = async () => {
      // event.preventDefault()
      // alert(`the ticker you entered is:  ${ticker}`)
      try {
        // debugger
        await axios.get(gainers).then((response) => {
          console.log('gainers', response)
          const resGainers = response.data
          setGainers((prevData) => [...prevData, resGainers])
          console.log('gainer  data', gainersDailyData)
        })
      } catch (error) {
        console.error(error)
      }
    }
    const getEarnings = async () => {
      // event.preventDefault()
      // alert(`the ticker you entered is:  ${ticker}`)
      try {
        // debugger
        await axios.get(earnings).then((response) => {
          console.log('earnings', response)
          const resEarnings = response.data
          setEarnings((prevData) => [...prevData, resEarnings])
          console.log('earnings data', earningsDailyData)
        })
      } catch (error) {
        console.error(error)
      }
    }
    const getTrending = async () => {
      // event.preventDefault()
      // alert(`the ticker you entered is:  ${ticker}`)
      try {
        // debugger
        await axios.get(trending).then((response) => {
          console.log('trending', response)
          const resTrending = response.data
          setTrending((prevData) => [...prevData, resTrending])
          console.log('trending data', trendingDailyData)
        })
      } catch (error) {
        console.error(error)
      }
    }
    // getCACData()
    // getDAGData()
    // getFTSEData()
    // getNews()
    // getGainers()
    // getEarnings()
    // getTrending()
  }, [CACData, gainersDailyData, trendingDailyData, earningsDailyData])

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
  if (dailyCACData && dailyDAXData && dailyFTSEData) {
    dataFormationCAC = dailyCACData && dataMassaging(dailyCACData)
    dataFormationFTSE = dailyDAXData && dataMassaging(dailyDAXData)
    dataFormationDAX = dailyFTSEData && dataMassaging(dailyFTSEData)

    // candleData = props.data && buildCandleData(props.data[0]['Time Series (Daily)'])
    // setChartdataState((prevChartData) => [...prevChartData, dataFormation])
  }

  const dataSPY = {
    labels: dataFormationFTSE && dataFormationFTSE.length > 0 ? dataFormationFTSE.map((items) => items.date) : '',
    datasets: [
      {
        label: 'FTSE',
        data: dataFormationFTSE && dataFormationFTSE.length > 0 ? dataFormationFTSE.map((items) => items.close) : '',
        fill: false,
        borderColor: '#4bc0c0',
      },
    ],
  }
  const dataDJA = {
    labels: dataFormationCAC && dataFormationCAC.length > 0 ? dataFormationCAC.map((items) => items.date) : '',
    datasets: [
      {
        label: 'CAC',
        data: dataFormationCAC && dataFormationCAC.length > 0 ? dataFormationCAC.map((items) => items.close) : '',
        fill: false,
        borderColor: '#741b47',
      },
    ],
  }

  const dataIXIC = {
    labels: dataFormationDAX && dataFormationDAX.length > 0 ? dataFormationDAX.map((items) => items.date) : '',
    datasets: [
      {
        label: 'DAX',
        data: dataFormationDAX && dataFormationDAX.length > 0 ? dataFormationDAX.map((items) => items.close) : '',
        fill: false,
        borderColor: '#f6b26b',
      },
    ],
  }

  if (europeNewsData.length > 0) {
    // debugger
    let currNews = europeNewsData
    // for (var i = 0; i < props.news[0].length; i++) {
    for (var i = 0; i < currNews.length; i++) {
      console.log('i', i)
      rows.push(
        createData(
          i + 1,
          // props.news[0][i].sourceName,
          // props.news[0][i].providerName,
          // props.news[0][i].title,
          // props.news[0][i].publishedDate
          (currNews[i].content.provider && currNews[i].content.provider.displayName) || 'No display Name available',
          (currNews[i].content.clickThroughUrl && currNews[i].content.clickThroughUrl.url) || 'link not available!',
          currNews[i].content.title,
          currNews[i].content.pubDate
        )
      )
    }
  }

  if (gainersDailyData.length > 0) {
    // for (var i = 0; i < props.news[0].length; i++) {
    for (var j = 0; j < gainersDailyData.length; j++) {
      gainRows.push(
        createGainData(
          // props.news[0][i].sourceName,
          // props.news[0][i].providerName,
          // props.news[0][i].title,
          // props.news[0][i].publishedDate
          gainersDailyData[j].symbol,
          gainersDailyData[j].name,
          gainersDailyData[j].price,
          gainersDailyData[j].change,
          gainersDailyData[j].changesPercentage
        )
      )
    }
  }

  if (earningsDailyData.length > 0) {
    // for (var i = 0; i < props.news[0].length; i++) {
    for (var k = 0; k < earningsDailyData.length; k++) {
      loseRows.push(
        createLoserData(
          // props.news[0][i].sourceName,
          // props.news[0][i].providerName,
          // props.news[0][i].title,
          // props.news[0][i].publishedDate
          earningsDailyData[k].symbol,
          earningsDailyData[k].name,
          earningsDailyData[k].price,
          earningsDailyData[k].change,
          earningsDailyData[k].changesPercentage
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
        <div className='europeHeader'>
          <h3>Europe Data Live...</h3>
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
          <div className='NEWS'>
            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
              <h3>&nbsp;&nbsp;&nbsp;News:</h3>
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
