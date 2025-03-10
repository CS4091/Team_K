import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useGlobalContext } from '../Context/GlobalContext'
import { ThemeProvider } from '@emotion/react'
import TopBar from '../Components/TopBar'
import UserModal from '../Components/UserModal'
import { Typography, Grid, Button, Snackbar } from '@mui/material'
import PostCard from '../Components/PostCard'

const UserPage = () => {
    const { userId } = useParams()
    const { user, theme, isModalOpen, setIsModalOpen, isSnackOpen, snackMessage, setIsSnackOpen, setSnackMessage } = useGlobalContext()
    const [userPosts, setUserPosts] = useState([])

    const getUserPosts = async () => {
        const response = await fetch(`http://localhost:3001/posts/user/${user.username}`)
        const doc = await response.json()
        setUserPosts(doc)
    }

    const resendVerificationEmail = async () => {
        try {
            const response = await fetch("http://localhost:3001/user/resend-verification", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email: user.userEmail })
            })
            const result = await response.json();
            if (response.ok) {
                setIsSnackOpen(true)
                setSnackMessage(result.message || 'Verification email resent successfully.')
            } else {
                setIsSnackOpen(true)
                setSnackMessage(result.message || 'Error resending verification email.')
            }
        } catch (error) {
            setIsSnackOpen(true)
            setSnackMessage('Error resending verification email.')
        }
    }

    useEffect(() => {
        getUserPosts()
    }, [user.username])

    return (
        <div>
            <ThemeProvider theme={theme}>
                <TopBar />
                {user.username ? (
                    <div>
                        <Typography variant='h3'>Posts for: {user.username}</Typography>
                        <Button 
                            variant="contained" 
                            color="primary" 
                            onClick={resendVerificationEmail}
                        >
                            Resend Verification Email
                        </Button>
                        {userPosts.length > 0 ? (
                            <Grid container spacing={3}>
                                {userPosts.map((post, index) => {
                                    return (
                                        <Grid item xs={12} key={index}>
                                            <PostCard post={post} />
                                        </Grid>
                                    )
                                })}
                            </Grid>
                        ) : (
                            <>No posts found</>
                        )}
                    </div>
                ) : (
                    <div>
                        Not Signed In!!
                    </div>
                )}
                <UserModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} />
            </ThemeProvider>
            <Snackbar open={isSnackOpen} autoHideDuration={3000} onClose={() => setIsSnackOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} message={snackMessage} />
        </div>
    )
}

export default UserPage
