import React from 'react'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import Helmet from 'react-helmet'

import config from 'config'
import NavLink from './NavLink'
import Nav from './Nav'
import Title from './Title'


const Header = () => (
  <header>
    <Helmet titleTemplate={`%s - ${config.title}`} />
    <Title>Franklin Javier</Title>
    <Nav>{config.routes.map((route, i) => <NavLink key={i} {...route} />)}</Nav>
  </header>
)

export default Header
