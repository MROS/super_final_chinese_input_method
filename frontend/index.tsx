import * as React from 'react'
import { Component } from 'react'
import { render } from 'react-dom'

class App extends Component {
    render() {
        return (<h1>超級輸入法</h1>)
    }
}

render(<App />, document.getElementById('root'))
