import React from 'react'
import ReactDOM from 'react-dom'
import {Route, BrowserRouter as Router} from 'react-router-dom'
import App from './App'
import GraphDevice from './GraphDevice'
import Header from './Header'

const Routes = () => (
    <Router>
        <div>
            <Header/>
            <Route exact path="/" component={App}/>
            <Route path="/device/:device_uuid" component={GraphDevice}/>
        </div>
    </Router>
)

export default Routes
