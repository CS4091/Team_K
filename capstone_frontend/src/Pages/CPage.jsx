import { ThemeProvider } from '@emotion/react'
import React, {useEffect, useState} from 'react'
import TopBar from '../Components/TopBar'
import UserModal from '../Components/UserModal'
import { useGlobalContext } from '../Context/GlobalContext'
import { useNavigate, useParams } from 'react-router-dom'
import { Box, Grid, Typography } from '@mui/material'
import PostCard from '../Components/PostCard'

const CPage = () => {
    const {theme, isModalOpen, setIsModalOpen, searched, setSearched, cPosts, cObject, setCPosts, setCObject} = useGlobalContext()
    const {cName} = useParams()
    const [loaded, setLoaded] = useState(false)

    const getClub = async () => {
        const response = await fetch(`http://localhost:3001/c/${cName}`)
        const object = await response.json()
        setCObject(object.data)
        setLoaded(true)
        setCPosts(object.posts)
        setSearched(true)
    }

    useEffect(() => {
            if (searched == false && cPosts.length == 0) {
                getClub()
            }
        }, [cPosts])
        
    useEffect(() => {
        console.log(cObject)
    }, [cObject])

    return (
        <div>
            <ThemeProvider theme={theme}>
                <TopBar/>
                {cObject.name ? (
                    <div>
                        <Box className="rounded-lg p-6 mb-6 text-center">
                            <Typography variant='h4' gutterBottom>{cObject.name}</Typography>
                            {cObject?.president?.username ? (
                                <Typography variant='subtitle1'>President: {cObject.president.username}</Typography>
                            ) : (
                                <Typography variant='subtitle1'>{cObject.department} - {cObject.number}</Typography>
                            )}
                            
                        </Box>
                        <Grid container spacing={3}>
                            {cPosts.map((post, index) => {
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

export default CPage