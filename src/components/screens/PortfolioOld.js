import React, { useState, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Navbar2 from '../layout/Navbar2/Navbar2'
import { DataContext } from '../AppContext/AppContext'
import { setSessionStorageItem, getSessionStorageItem, removeSessionStorageItem } from '../../frontendUtils/utils.js'
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

  const [error, setError] = useState('')
  const [privateData, setPrivateData] = useState('')

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
          debugger
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

  const showCtrl = (e, idx) => {
    debugger
    // alert(idx)
    e.preventDefault()
    console.log('index', idx)
    if (e.currentTarget.id == idx) {
      if (isShow === false) setIsShow(true)
    }
  }
  const hideCtrl = () => {
    if (isShow === true) setIsShow(false)
  }

  // const isticker = document.getElementById('TSLA').innerHTML
  // console.log('isticker', isticker)
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
            <ul className='view_list'>
              {tickerDataCurrPriceList && tickerDataCurrPriceList.length > 0
                ? tickerDataCurrPriceList.map((item, idx) => (
                    <li id={idx} className='ticker_row' key={idx}>
                      <div className='watchlist_items'>
                        <div className='symbol' id={item['01. symbol']}>
                          {item['01. symbol']}
                        </div>
                        <div className='curr_price'>{(Math.round(item['05. price'] * 100) / 100).toFixed(3)}</div>

                        <div
                          className='row_float_items'
                          id={idx}
                          key={idx}
                          onMouseEnter={(e) => showCtrl(e, idx)}
                          onMouseLeave={() => hideCtrl()}
                        >
                          <div className={`${!isShow ? 'isShow' : ''} noShow`}>
                            <div className='buy' id={idx}>
                              Buy
                            </div>
                            <div className='sell' id={idx}>
                              Sell
                            </div>
                            <i className='fa-solid fa-trash-can' id={idx}></i>
                            <i
                              className={`${!isShowQuote ? 'fa-solid fa-caret-left' : ''} fa-solid fa-caret-down`}
                              id={idx}
                              onClick={showQuotes}
                            ></i>
                          </div>
                        </div>
                      </div>
                      <div className={`${!isShowQuote ? 'quoteActive' : ''} noQuote`}>
                        <div className='quoteWrapper'>
                          <div className='openPrice'>{item['02. open']}</div>
                          <div className='closePrice'>{item['08. previous close']}</div>
                          <div className='dayHigh'>{item['03. high']}</div>
                          <div className='dayLow'>{item['04. low']}</div>
                          <div className='volume'>{item['06. volume']}</div>
                        </div>
                      </div>
                    </li>
                  ))
                : 'No tickers added yet'}
            </ul>
            {/* <ul>
              <li>{jsn_obj_realtime.price}</li>
            </ul> */}
          </div>
        </div>
        <div className='datatable is-primary right'>
          {/* {isticker && (
            <div className='Index'>
              <img src='index.png' alt='alternate_text' width='460px' height='270px' />
            </div>
          )} */}
        </div>
      </section>
    </>
  )
}

export default Portfolio
