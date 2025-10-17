import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import TestQualityForm from './TestQualityForm.jsx'

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <TestQualityForm />
    </StrictMode>,
)

