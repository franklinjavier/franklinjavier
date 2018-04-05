import React from 'react'
import { Route, Switch } from 'react-router-dom'

import config from 'config'
import Wrapper from './Wrapper'

const Main = () => (
  <Wrapper>
    <Switch>
      {config.routes.map(route => <Route key={route.path} {...route} /> )}
    </Switch>
  </Wrapper>
)

export default Main
