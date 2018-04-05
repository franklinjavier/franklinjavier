import React from 'react'
import Helmet from 'react-helmet'
import Markdown from 'react-remarkable'

const Post = ({ source, title, date, children }) => (
  <React.Fragment>
    <h1>{title}</h1>
    <Markdown source={source} />
    <Helmet title={title} />
  </React.Fragment>
)

export default Post
