import React, { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { Task } from '../types/Task'
import TaskDetailModal from './TaskDetailModal'
import '../styles/TaskList.scss'

export default function TaskList() {

    const API_URL = process.env.REACT_APP_API_URL;

    const [tasks, setTasks] = useState<Task[]>([])
    const [selectedTask, setSelectedTask] = useState<Task | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isAddingTask, setIsAddingTask] = useState(false)
    const [error, setError] = useState<string | null>(null);

    const fetchTasks = useCallback(() => {
        axios.get<Task[]>(`${API_URL}/api/tasks/`).then((response) => {
            setTasks(response.data)
        })
        .catch(error => {
            setError('Could not fetch tasks. Please try again later.')
            console.error(error)
        })
    }, [])

    useEffect(() => {
        fetchTasks()
    }, [fetchTasks])

    const selectTask = (task: Task) => {
        setSelectedTask(task)
        setIsAddingTask(false)
        setIsModalOpen(true)
    }

    const updateTasks = () => {
        fetchTasks()
        setSelectedTask(null)
        setIsModalOpen(false)
        setIsAddingTask(false)
    }

    const addNewTask = () => {
        setIsAddingTask(true)
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setIsModalOpen(false)
        setSelectedTask(null)
    }

    const toggleComplete = (task: Task) => {
        axios
            .put(`${API_URL}/api/tasks/${task.id}/`, {
                ...task,
                completed: !task.completed,
            })
            .then(() => {
                fetchTasks()
            })
            .catch(error => {
                setError('Could not update tasks. Please try again later.')
                console.error(error)
            })
    }

    const deleteTask = (taskId: number) => {
        axios.delete(`${API_URL}/api/tasks/${taskId}/`).then(() => {
            fetchTasks()
        })
        .catch(error => {
            setError('Could not delete task. Please try again later.');
            console.error(error)
        })
    }

    return (
        <div
            className="tasklist"
            style={isModalOpen ? { filter: 'blur(5px)' } : {}}
        >
            <h1>Global Task List</h1>
            {error && <div className="error-message">{error}</div>}
            {tasks.length > 0 ? (
                <ul>
                    {tasks.map((task) => (
                        <li key={task.id}>
                            <label className="checkbox">
                                <input
                                    type="checkbox"
                                    checked={task.completed}
                                    onChange={() => toggleComplete(task)}
                                />
                                <span></span>
                            </label>
                            <div
                                className="task-text"
                                onClick={() => selectTask(task)}
                            >
                                {task.title}
                            </div>
                            <button onClick={() => deleteTask(task.id)}>
                                Delete
                            </button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>Click the + button to start adding tasks!</p>
            )}
            <button className="add-task" onClick={addNewTask}>
                +
            </button>
            {isModalOpen && (
                <TaskDetailModal
                    task={selectedTask}
                    isAddingTask={isAddingTask}
                    updateTasks={updateTasks}
                    closeModal={closeModal}
                />
            )}
        </div>
    )
}
