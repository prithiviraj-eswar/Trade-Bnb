import React, { useState, useContext, useEffect } from 'react'
import { BrowserRouter as Routes, Outlet, Route, Link, useNavigate, useParams, useRouteMatch } from 'react-router-dom'
import axios from 'axios'
import Navbar2 from '../layout/Navbar2/Navbar2'
import { DataContext } from '../AppContext/AppContext'
import { setSessionStorageItem, getSessionStorageItem, removeSessionStorageItem } from '../../frontendUtils/utils.js'
import { DataGridPro, GridActionsCellItem } from '@mui/x-data-grid-pro'
import TransModal from '../layout/Modal/ModalWindow'
import OrderTable from '../layout/OrderTable/OrderTable'
import PositionsTable from '../layout/PositionsTable/PositionsTable'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import { FormControlLabel, Switch } from '@material-ui/core'

import './Market.css'

const Portfolio = (props) => {
  const navigate = useNavigate()
  const [tickerDataList, setTickerDataList] = useContext(DataContext)
  const [tickerDataCurrPriceList, setTickerDataCurrPriceList] = useContext(DataContext)
  const [quoteData, setQuoteData] = useState([])
  const [priceData, setPriceData] = useState([])
  const [isShow, setIsShow] = useState(false)
  const [isShowQuote, setIsShowQuote] = useState(false)
  const [status, setStatus] = useState('')
  const [ticker, setTicker] = useState('')
  const [isShowModal, setIsShowModal] = useState(false)
  const [modalData, setModalData] = useState([])
  const [autoAssign, setAutoAssign] = useState(true)
  const [orderData, setOrderData] = useState([])
  const [toggleGrid, setGridState] = useState(false)

  const [error, setError] = useState('')
  const [privateData, setPrivateData] = useState('')

  const [hoveredRow, setHoveredRow] = React.useState(null)

  useEffect(() => {
    if (!localStorage.getItem('authToken')) {
      navigate('/login')
    }
    // debugger
    const fetchPrivateData = async () => {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
      }
      const { data } = await axios.get('/api/private', config)
      setPrivateData(data.data)
      // try {
      //   const { data } = await axios.get('/api/private', config)
      //   setPrivateData(data.data)
      // } catch (error) {
      //   localStorage.removeItem('authToken')
      //   setError('You are not authorized please login')
      // }
    }
    // document.body.innerHTML = document.body.innerHTML.replace('MUI X: Missing license key', '')

    fetchPrivateData()
  }, [navigate])

  const quoteDataList = () => {
    // debugger
    setSessionStorageItem({ key: 'tickerList', item: tickerDataList })

    const sessiondata1 = getSessionStorageItem({ item: 'tickerList' })
    if (sessiondata1) {
      // setData((prevData) => [...prevData, dataList])
      // if (tickerDataList && tickerDataList.length > 0) {
      setQuoteData((prevData) => [...prevData, tickerDataList])
      // }
      console.log('Session quote data', quoteData)
    }
  }
  const pricedataList = () => {
    // debugger
    setSessionStorageItem({ key: 'tickerDataCurrPriceList', item: tickerDataCurrPriceList })

    const sessiondata2 = getSessionStorageItem({ item: 'tickerDataCurrPriceList' })
    if (sessiondata2) {
      // setData((prevData) => [...prevData, dataList])
      // if (tickerDataList && tickerDataList.length > 0) {
      setPriceData((prevData) => [...prevData, tickerDataCurrPriceList])
      // }
      console.log('Session price data', priceData)
    }
  }

  const onMouseEnterRow = (event) => {
    const id = Number(event.currentTarget.getAttribute('data-id'))
    setHoveredRow(id)
  }

  const onMouseLeaveRow = (event) => {
    setHoveredRow(null)
  }

  // const options = {
  //   method: 'GET',
  //   url: 'https://twelve-data1.p.rapidapi.com/quote',
  //   params: { symbol: ticker, interval: '1day', outputsize: '30', format: 'json' },
  //   headers: {
  //     'X-RapidAPI-Host': 'twelve-data1.p.rapidapi.com',
  //     'X-RapidAPI-Key': '285ae9ae64mshb0023a8ab269acap1da29fjsn48034d41e0c7',
  //   },
  // }

  // const options = {
  //   method: 'GET',
  //   url: 'https://mboum-finance.p.rapidapi.com/mo/module/',
  //   params: { symbol: ticker, module: 'asset-profile,financial-data,earnings' },
  //   headers: {
  //     'X-RapidAPI-Host': 'mboum-finance.p.rapidapi.com',
  //     'X-RapidAPI-Key': '285ae9ae64mshb0023a8ab269acap1da29fjsn48034d41e0c7',
  //   },
  // }

  const options = {
    method: 'GET',
    url: 'https://alpha-vantage.p.rapidapi.com/query',
    params: { function: 'GLOBAL_QUOTE', symbol: ticker, datatype: 'json' },
    headers: {
      'X-RapidAPI-Host': 'alpha-vantage.p.rapidapi.com',
      'X-RapidAPI-Key': '285ae9ae64mshb0023a8ab269acap1da29fjsn48034d41e0c7',
    },
  }

  const curr_price = {
    method: 'GET',
    url: 'https://twelve-data1.p.rapidapi.com/price',
    params: { symbol: ticker, format: 'json', outputsize: '30' },
    headers: {
      'X-RapidAPI-Host': 'twelve-data1.p.rapidapi.com',
      'X-RapidAPI-Key': '285ae9ae64mshb0023a8ab269acap1da29fjsn48034d41e0c7',
    },
  }

  const showQuotes = () => {
    setIsShowQuote((isShowQuote) => !isShowQuote)
  }

  const getQuote = async () => {
    // alert(`the ticker you entered is:  ${ticker}`)
    try {
      // debugger
      await axios.request(options).then((response1) => {
        const res1 = response1.data
        console.log('quote data', res1)
        setTickerDataList((prevTickerData) => [...prevTickerData, res1])
        setSessionStorageItem({ key: 'tickerList', item: tickerDataList })
        console.log('quote data', tickerDataList)
        quoteDataList()
      })
    } catch (error) {
      console.error(error)
    }
  }

  const getPrice = async (event) => {
    event.preventDefault()
    // alert(`the ticker you entered is:  ${ticker}`)
    try {
      // debugger
      if (ticker.length !== 0) {
        await axios.request(options).then((response2) => {
          const res2 = response2.data['Global Quote']
          //   debugger
          console.log('response', res2)
          const isEmpty = Object.keys(res2).length === 0
          if (!isEmpty) {
            setPriceData([...priceData, res2])
            console.log('state data', priceData)
            setTickerDataCurrPriceList((prevTickerCurrPriceData) => [...prevTickerCurrPriceData, res2])
            console.log('contextData', tickerDataCurrPriceList)
            pricedataList()
          } else {
            alert('symbol not listed on exchange!')
          }
        })
      }

      // getQuote()
    } catch (error) {
      console.error(error)
    }
    setTicker('')
  }

  const logoutHandler = () => {
    localStorage.setItem('authtoken', undefined)
    localStorage.removeItem('authToken')
    // removeSessionStorageItem({ item: 'tickerList' })
    navigate('/login')
  }

  //   const showCtrl = (e, idx) => {
  //     debugger
  //     // alert(idx)
  //     e.preventDefault()
  //     console.log('index', idx)
  //     if (e.currentTarget.id == idx) {
  //       if (isShow === false) setIsShow(true)
  //     }
  //   }
  //   const hideCtrl = () => {
  //     if (isShow === true) setIsShow(false)
  //   }

  const initiateOrder = (id, e) => {
    debugger
    let mData = []
    e.preventDefault()
    console.log('buy', e)
    mData.push({
      row: id.row,
      eventDat: e.target.className,
    })
    setIsShowModal((isShowModal) => true)
    setModalData((prevData) => [...prevData, mData])
  }

  const handleAutoAssignSwitch = (e) => {
    setAutoAssign({ autoAssign: e })
  }

  const handleGridChange = (event) => {
    setGridState(event.target.checked)
    handleAutoAssignSwitch(event.target.checked)
  }

  const columns = [
    { field: 'name', headerName: 'Ticker', width: 100, editable: false },

    { field: 'currentPrice', headerName: 'Current Price', width: 100, type: 'number', editable: false },
    {
      field: 'actions',
      headerName: '',
      width: 200,
      sortable: false,
      disableColumnMenu: true,
      backgroundColor: 'transparent',
      renderCell: (params) => {
        if (hoveredRow === params.id) {
          return (
            <Box
              sx={{
                backgroundColor: '#f0f0f0',
                width: '100%',
                height: 'auto',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <IconButton onClick={(e) => initiateOrder(params, e)}>
                <div className='buy'>Buy</div>
              </IconButton>
              <IconButton onClick={(e) => initiateOrder(params, e)}>
                <div className='sell'>Sell</div>
              </IconButton>
              <IconButton onClick={() => console.log(params.id)}>
                <i className='fa-solid fa-trash-can'></i>
              </IconButton>
              <IconButton onClick={() => console.log(params.id)}>
                <i
                  className={`${!isShowQuote ? 'fa-solid fa-caret-left' : ''} fa-solid fa-caret-down`}
                  onClick={showQuotes}
                ></i>
              </IconButton>
            </Box>
          )
        } else return null
      },
    },
  ]

  let row = []
  if (tickerDataCurrPriceList && tickerDataCurrPriceList.length > 0) {
    for (var i = 0; i < tickerDataCurrPriceList.length; i++) {
      //   debugger
      row.push({
        id: i,
        name: tickerDataCurrPriceList && tickerDataCurrPriceList[i]['01. symbol'],
        currentPrice: tickerDataCurrPriceList && tickerDataCurrPriceList[i]['05. price'],
      })
    }
  }

  console.log('tickerDataCurrPriceList', tickerDataCurrPriceList)
  console.log('')
  return error ? (
    <span className='error-message'>{error}</span>
  ) : (
    <>
      <section className='trade_wrapper'>
        <div className='sub_header'>
          <Navbar2 />
          <i className='fa-solid fa-power-off logout' onClick={logoutHandler}></i>
          <br></br>
        </div>
        <TransModal
          isShowModal={isShowModal}
          modalData={modalData}
          setIsShowModal={setIsShowModal}
          setModalData={setModalData}
          setOrderData={setOrderData}
          handleAutoAssignSwitch={handleAutoAssignSwitch}
        />
        <div className='secondary navigation header _ subHeader'></div>
        <div className='datatable is-secondary left'>
          <form onSubmit={getPrice}>
            <label className='wishlist_grid'>
              <input
                type='text'
                id='ticker_search'
                placeholder='ticker search'
                value={ticker}
                onChange={(e) => setTicker(e.target.value)}
              ></input>
              <input className='search is_secondary' type='submit' value=''></input>
            </label>
          </form>

          <div className='watchList_Grid'>
            <div style={{ height: '100vh', width: '100%' }}>
              <DataGridPro
                // checkboxSelection
                rows={row}
                columns={columns}
                initialState={{ pinnedColumns: { right: ['actions'] } }}
                componentsProps={{
                  row: {
                    onMouseEnter: onMouseEnterRow,
                    onMouseLeave: onMouseLeaveRow,
                  },
                }}
                sx={{
                  '& .MuiDataGrid-iconSeparator': {
                    display: 'none',
                  },
                  '& .MuiDataGrid-pinnedColumnHeaders': {
                    boxShadow: 'none',
                    backgroundColor: 'transparent',
                  },
                  '& .MuiDataGrid-pinnedColumns': {
                    boxShadow: 'none',
                    // backgroundColor: "transparent",
                    '& .MuiDataGrid-cell': {
                      padding: 0,
                    },
                  },
                  '& .MuiDataGrid-row': {
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'whitesmoke',
                    },
                    '&:first-child': {
                      borderTop: '1px solid rgba(224, 224, 224, 1)',
                    },
                  },
                  '& .MuiDataGrid-cell:focus': {
                    outline: 'none',
                  },
                  '& .MuiDataGrid-cell:focus-within': {
                    outline: 'none',
                  },
                }}
              />
            </div>
          </div>
        </div>
        <div className='datatable is-primary right'>
          <div>
            <FormControlLabel
              control={
                <Switch
                  checked={toggleGrid}
                  onChange={handleGridChange}
                  value={toggleGrid}
                  inputProps={{ 'aria-label': 'secondary checkbox' }}
                />
              }
              label={toggleGrid === false ? 'Orders Placed' : 'Active Positions'}
              labelPlacement='start'
            />
          </div>
          {toggleGrid === false ? (
            <OrderTable orderData={orderData} />
          ) : (
            <PositionsTable orderData={orderData} tickerDataCurrPriceList={tickerDataCurrPriceList} />
          )}
        </div>
      </section>
    </>
  )
}

export default Portfolio
