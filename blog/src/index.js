import React from 'react'
import { render } from 'react-snapshot'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import registerServiceWorker from './registerServiceWorker'

const elementRoot = document.getElementById('root')

render(
  <BrowserRouter>
    <App />
  </BrowserRouter>, 
  elementRoot
)

registerServiceWorker()

if (module.hot) {
  module.hot.accept(App, () => {
    render(<App />, elementRoot)
  })
}
