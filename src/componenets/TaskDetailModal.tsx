import React, { useState, useEffect } from 'react'
import Modal from 'react-modal'
import axios from 'axios'
import { Task } from '../types/Task'
import '../styles/TaskDetailModal.scss'

interface TaskDetailModalProps {
    task: Task | null
    isAddingTask: boolean
    updateTasks: () => void
    closeModal: () => void
}

Modal.setAppElement('#root')

export default function TaskDetailModal({
    task,
    isAddingTask,
    updateTasks,
    closeModal,
}: TaskDetailModalProps) {

    const API_URL = process.env.REACT_APP_API_URL;

    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (task) {
            setTitle(task.title)
            setDescription(task.description)
        } else {
            setTitle('')
            setDescription('')
        }
    }, [task])

    const handleSave = () => {
        const taskData = {
            title,
            description,
            completed: task ? task.completed : false,
        }

        if (isAddingTask) {
            axios.post(`${API_URL}/api/tasks/`, taskData).then(() => {
                updateTasks()
            })
            .catch(error => {
                setError('Could not add task. Please try again later.')
                console.error(error)
            })
        } else if (task) {
            axios.put(`${API_URL}/api/tasks/${task.id}/`, taskData).then(() => {
                updateTasks()
            })
            .catch(error => {
                setError('Could not update task. Please try again later.')
                console.error(error)
            })
        }
    }

    const handleDelete = () => {
        if (task) {
            axios.delete(`${API_URL}/api/tasks/${task.id}/`).then(() => {
                updateTasks()
                closeModal()
            })
            .catch(error => {
                setError('Could not delete task. Please try again later.')
                console.error(error)
            })
        }
    }

    return (
        <Modal
            isOpen={true}
            onRequestClose={closeModal}
            contentLabel="Task Detail"
            className="taskmodal"
            overlayClassName="overlay"
        >
            <h2>{isAddingTask ? 'Add Task' : 'Edit Task'}</h2>
            {error && <div className="error-message">{error}</div>}
            <form
                onSubmit={(e) => {
                    e.preventDefault()
                    handleSave()
                }}
            >
                <section>
                    <label>
                        Title:
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </label>
                    <label>
                        Description:
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={7}
                            required
                        />
                    </label>
                </section>
                <button type="submit">Save</button>
                {!isAddingTask && (
                    <button
                        type="button"
                        className="delete"
                        onClick={handleDelete}
                    >
                        Delete
                    </button>
                )}
                <button type="button" onClick={closeModal}>
                    Cancel
                </button>
            </form>
        </Modal>
    )
}
