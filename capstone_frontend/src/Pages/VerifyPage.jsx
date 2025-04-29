import React, { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useGlobalContext } from '../Context/GlobalContext'
import { ThemeProvider } from '@emotion/react'
import TopBar from '../Components/TopBar'
import UserModal from '../Components/UserModal'

const VerifyPage = () => {
    const {token, email} = useParams()
    const {user, setUser, theme, isModalOpen, setIsModalOpen, setIsSnackOpen, setSnackMessage, setCookie} = useGlobalContext()
    const navigate = useNavigate()

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
            setSnackMessage("Unable to verify")
        } else{
            const result = await response.json()
            setUser(result.user)
            setSnackMessage("Successfully verified and signed in")
            const curUser = {
                username: result.username,
                userEmail: result.userEmail,
                userRoles: result.userRoles,
                _id: result._id,
                verified: result.verified
            }
            setCookie('user', curUser)
        }
        setIsSnackOpen(true)
        navigate("/")
    }

    useEffect(() => {
        verify()
    }, [])

    return (
        <div>
            <ThemeProvider theme={theme}>
                <TopBar/>
                <h3>{token} {email}</h3>
                <UserModal isOpen={isModalOpen} setIsOpen={setIsModalOpen}/>
            </ThemeProvider>
        </div>
    )
}

export default VerifyPage
