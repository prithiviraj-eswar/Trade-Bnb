import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './components/AppContext/App'
import reportWebVitals from './reportWebVitals'
// app state import

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
)

reportWebVitals()
