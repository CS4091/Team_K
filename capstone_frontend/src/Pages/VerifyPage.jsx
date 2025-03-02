import React from 'react'
import { useParams } from 'react-router-dom'

const VerifyPage = () => {
    const {token} = useParams()
    return (
        <div>VerifyPage
            <h3>{token}</h3>
        </div>
    )
}

export default VerifyPage