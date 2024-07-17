import React from 'react'
import './styles/App.scss'
import TaskList from './componenets/TaskList'

function App() {
    return (
        <div className="App">
            <div className="container">
                <TaskList />
            </div>
        </div>
    )
}

export default App
