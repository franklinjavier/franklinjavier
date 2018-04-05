import React from 'react'
import { Route, Link, Switch } from 'react-router-dom'
import Helmet from 'react-helmet'
import Post from 'components/Post'
import Nav from 'components/Nav'
import NavLink from 'components/NavLink'
import NotFound from 'pages/NotFound'

import hello from 'posts/hello-word.js'

const Hello = () => <Post source={hello} />

const routes = [
  {
    title: 'Hello World',
    to: 'hello-world',
    component: Hello,
    exact: true
  }
]

const Topic = ({ match }) => (
  <div>
    <h3>asdfasfs {match.params.slugname}xxx</h3>
  </div>
)


const FullRoster = () => (
  <div>
    <ul>
      {
        routes.map(p => (
          <li key={p.to}>
            <Link to={`/blog/${p.to}`}>{p.title}</Link>
          </li>
        ))
      }
    </ul>
  </div>
)

const Blog = () => (
  <Switch>
    <Route exact path='/blog' component={FullRoster} />
    <Route path='/blog/:slugname' component={Topic} />
  </Switch>
)


export default Blog
