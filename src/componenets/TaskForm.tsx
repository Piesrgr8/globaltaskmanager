import axios from 'axios'
import React, { useState } from 'react'
import { Task } from '../types/Task'

interface TaskFormProps {
    updateTasks: () => void
}

export default function TaskForm({ updateTasks }: TaskFormProps) {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault()
        axios
            .post<Task>('/api/tasks/', { title, description, completed: false })
            .then(() => {
                updateTasks()
                setTitle('')
                setDescription('')
            })
    }
    return (
        <form onSubmit={handleSubmit} className="taskform">
            <h2>Add Task</h2>
            <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title"
            />
            <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description"
            />
            <button type="submit">Add Task</button>
        </form>
    )
}
