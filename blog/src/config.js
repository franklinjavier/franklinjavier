import { Home, About, Blog, NotFound } from 'pages'

const config = {
  title: 'Franklin Javier',

  routes: [{
    title: 'Home',
    component: Home,
    path: '/',
    exact: true
  },{
    title: 'About',
    component: About,
    path: '/about'
  },{
    title: 'Blog',
    component: Blog,
    path: '/blog'
  },{
    component: NotFound,
    path: ''
  }]
}

export default config
