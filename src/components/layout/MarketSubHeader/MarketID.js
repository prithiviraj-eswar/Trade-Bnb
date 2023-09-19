import * as React from 'react'
import { BrowserRouter as Router, Link, Route, useParams } from 'react-router-dom'
import NorthAmerica from '../../screens/NorthAmerica/NorthAmerica'

export default function MarketID() {
  let { marketId } = useParams()
  console.log('marketID', marketId)
  // debugger
  return (
    <div>
      <h3>{marketId}</h3>
    </div>
  )
}
