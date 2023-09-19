import React, { useState } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import { FormControlLabel, Switch } from '@material-ui/core'
import { compareAsc, format } from 'date-fns'
import './ModalWindow.css'

const TransModal = ({ isShowModal, modalData, setIsShowModal, setModalData, handleAutoAssignSwitch, setOrderData }) => {
  const [ticker, setTicker] = useState('')
  const [newValue, setPrice] = useState('')
  const [qty, setQty] = useState('')
  const [date, setDate] = useState('')
  const [isError, setError] = useState('')
  const [state, setState] = useState(false)
  const [transType, setTransType] = useState('')
  const navigate = useNavigate()
  const today = new Date()
  let extract =
    modalData.length > 0
      ? {
          transT: modalData && modalData[0] && modalData[0][0].eventDat,
          transRow: modalData && modalData[0] && modalData[0][0].row,
        }
      : ''

  const resetModal = (e) => {
    e.preventDefault()
    setIsShowModal((isShowModal) => false)
    setModalData([])
    setTransType('')
  }

  const transHandler = async (e) => {
    e.preventDefault()
    // debugger
    const config = {
      header: {
        'Content-Type': 'application/json',
      },
    }

    let modData = []
    modData.push({
      Ticker: extract.transRow.name,
      Qty: e.target[1].value,
      Price: e.target[2].value,
      orderType: e.target[3].value,
      orderStatus: 'Pending',
      orderDate: format(today, 'dd-mm-yyyy hh:mm:ss'),
    })

    try {
      //   const { data } = await axios.post('/api/auth/transaction', { ticker, newValue, qty, date }, config)

      //   localStorage.setItem('transaction', data)
      setOrderData((prevData) => [...prevData, modData])
      setTimeout(() => {
        resetModal(e)
      }, 100)
      //   navigate('/market')
    } catch (error) {
      // setError(error.response.data);
      setTimeout(() => {
        setError('Invalid request, we are out of market hours...!')
      }, 1000)
    }
  }

  const handleChange = (event) => {
    debugger
    if (extract && extract.transT.toLowerCase() === 'buy' && transType === '') {
      setTransType('Sell')
    }
    if (extract && extract.transT.toLowerCase() === 'sell' && transType === '') {
      setTransType('Buy')
    }
    if (transType.toLowerCase() === 'buy') {
      setTransType('Sell')
    }
    if (transType.toLowerCase() === 'sell') {
      setTransType('Buy')
    }
    setState(event.target.checked)
    handleAutoAssignSwitch(event.target.checked)
  }

  return (
    <div className={`${!isShowModal ? 'modal_active' : ''} modal_show`}>
      <div className='transaction-form'>
        <div className='form-box modal-box solid'>
          <form onSubmit={transHandler} className='transaction-screen__form'>
            <h3 className='transaction__title'>{extract.transRow && extract.transRow.name}</h3>
            <div>
              <FormControlLabel
                control={
                  <Switch
                    checked={state}
                    onChange={handleChange}
                    value={state}
                    inputProps={{ 'aria-label': 'secondary checkbox' }}
                  />
                }
                label={transType === '' ? extract && extract.transT.toUpperCase() : transType}
                labelPlacement='start'
              />
            </div>
            {isError && <span className='error-message'>{isError}</span>}
            <div className='form-group'>
              <label htmlFor='Qty'>
                Qty:<a>Quantity should be {'>'} 0 and in metric of 1</a>
              </label>

              <input
                type='number'
                required
                id='Qty'
                placeholder='Quantity'
                onChange={(e) => setQty(e.target.value)}
                value={qty}
                tabIndex={1}
              />
            </div>
            <div className='form-group'>
              <label htmlFor='price'>
                Price: <a>price should be {'>'} 0 and in metric of 0.05</a>
              </label>
              <input
                type='number'
                required
                id='price'
                placeholder='Enter price'
                onChange={(e) => setPrice(e.target.value)}
                value={newValue !== 0 ? newValue : extract.transRow && extract.transRow.currentPrice}
                tabIndex={2}
              />
            </div>
            <button
              type='submit'
              className='btn btn-primary'
              id={transType === '' ? extract && extract.transT.toUpperCase() : transType}
              tabIndex={3}
              value={transType === '' ? extract && extract.transT.toUpperCase() : transType}
            >
              {transType === '' ? extract && extract.transT.toUpperCase() : transType}
            </button>
            <input
              type='button'
              className='modal_cancel btn btn-secondary'
              tabIndex={4}
              onClick={(e) => resetModal(e)}
              value='Cancel'
            />
          </form>
        </div>
      </div>
    </div>
  )
}

export default TransModal
