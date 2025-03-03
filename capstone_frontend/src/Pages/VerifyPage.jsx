import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useGlobalContext } from '../Context/GlobalContext'

const VerifyPage = () => {
    const {token, email} = useParams()
    const {user, setUser} = useGlobalContext()

    const verify = async () => {
        const user = {
            email: email,
            token: parseInt(token)
        }
        const response = await fetch('http://localhost:3001/user/verify', {
            method: 'PUT',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify(user),
        });
        
        if(!response.ok) {
            //do something
        }
        const result = await response.json()
        console.log(result)
    }

    useEffect(() => {
        verify()
    }, [])

    return (
        <div>VerifyPage
            <h3>{token} {email}</h3>
        </div>
    )
}

export default VerifyPage