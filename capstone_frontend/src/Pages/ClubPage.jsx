import { ThemeProvider } from '@emotion/react'
import React, {useEffect} from 'react'
import TopBar from '../Components/TopBar'
import UserModal from '../Components/UserModal'
import { useGlobalContext } from '../Context/GlobalContext'
import { useNavigate, useParams } from 'react-router-dom'
import { Box, Grid, Typography } from '@mui/material'
import PostCard from '../Components/PostCard'

const ClubPage = () => {
    const {theme, isModalOpen, setIsModalOpen, user, searched, setSearched, clubPosts, setClubPosts, clubObject, setClubObject} = useGlobalContext()
    const {cName} = useParams()
    const navigate = useNavigate()

    const getClub = async () => {
        const response = await fetch(`http://localhost:3001/club/${cName}`)
        const className = await response.json()
        setClubObject(className)
        const postResponse = await fetch(`http://localhost:3001/post/club/${cName}`)
        const postList = await postResponse.json()
        setClubPosts(postList)
        setSearched(true)
        console.log(postList)
    }

    useEffect(() => {
           //TODO: finish this page, add search by club to the top somehow
            if (searched == false && clubPosts.length == 0) {
                getClub()
            }
            
        }, [clubPosts])

    return (
        <div>
            <ThemeProvider theme={theme}>
                <TopBar/>
                {clubObject ? (
                    <div>
                        <Box className="rounded-lg p-6 mb-6 text-center">
                            <Typography variant='h4' gutterBottom>{clubObject.name}</Typography>
                            <Typography variant='subtitle1'>President: {clubObject.president}</Typography>
                        </Box>
                        <Grid container spacing={3}>
                            {clubPosts.map((post, index) => {
                                return (
                                    <Grid item xs={12} key={index}>
                                        <PostCard post={post} />
                                    </Grid>
                                )
                            })}
                        </Grid>
                    </div>
                ) : (
                    <>Loading...</>
                )}
                <UserModal isOpen={isModalOpen} setIsOpen={setIsModalOpen}/>
            </ThemeProvider>
        </div>
    )
}

export default ClubPage