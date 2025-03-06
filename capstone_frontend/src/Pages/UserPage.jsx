import React, {useEffect, useState} from 'react'
import { useParams } from 'react-router-dom'
import { useGlobalContext } from '../Context/GlobalContext'
import { ThemeProvider } from '@emotion/react'
import TopBar from '../Components/TopBar'
import UserModal from '../Components/UserModal'
import { Typography, Grid } from '@mui/material'
import PostCard from '../Components/PostCard'
import {Snackbar} from '@mui/material'

const UserPage = () => {
    const {userId} = useParams()
    const {user, theme, isModalOpen, setIsModalOpen, isSnackOpen, snackMessage, setIsSnackOpen} = useGlobalContext()
    const [userPosts, setUserPosts] = useState([])

    const getUserPosts = async () => {
      const response = await fetch(`http://localhost:3001/posts/user/${user.username}`)
      const doc = await response.json()
      setUserPosts(doc)
    }


    useEffect(() => {
      getUserPosts()
    }, [user.username])

    return (
      <div>
        <ThemeProvider theme={theme}>
        <TopBar></TopBar>
        {user.username  ? (
            <div>
              <Typography variant='h3'>Posts for: {user.username}</Typography>
              {userPosts.length > 0 ? (
                <Grid container spacing={3}>
                {userPosts.map((post, index) => {
                    return (
                        <Grid item xs={12} key={index}>
                            <PostCard post={post}/>
                        </Grid>
                    )
                })}
                </Grid>
              ) : (<>No posts found</>)}
             
            </div>
        ) : (
          <div>
            Not Signed In!!
          </div>
        )}
         <UserModal isOpen={isModalOpen} setIsOpen={setIsModalOpen}/>
       </ThemeProvider>
       <Snackbar open={isSnackOpen} autoHideDuration={3000} onClose={() => setIsSnackOpen(false)} anchorOrigin={{vertical: 'bottom', horizontal: 'center'}} message={snackMessage}/>
      </div>
    )
}

export default UserPage