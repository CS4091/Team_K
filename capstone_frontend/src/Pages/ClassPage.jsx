import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import TopBar from '../Components/TopBar'
import { useGlobalContext } from '../Context/GlobalContext'
import { ThemeProvider } from '@emotion/react'
import UserModal from '../Components/UserModal'
import { Typography, Box, Card, CardContent, Grid, Grid2, } from '@mui/material'
import PostCard from '../Components/PostCard'

const ClassPage = () => {
    const {theme, isModalOpen, setIsModalOpen, classPosts, setClassPosts, searched, setSearched, classObject ,setClassObject} = useGlobalContext()
    // const [searched, setSearched] = useState(false)
    
    const {cName} = useParams()
    const navigate = useNavigate()

    const getClass = async () => {
        const response = await fetch(`http://localhost:3001/class/${cName}`)
        const className = await response.json()
        setClassObject(className)
        const postResponse = await fetch(`http://localhost:3001/post/class/${cName}`)
        const postList = await postResponse.json()
        setClassPosts(postList)
        setSearched(true)
    }

    useEffect(() => {
       
        if (searched == false && classPosts.length == 0) {
            getClass()
        }
        
    }, [classPosts])

    return (
        <div>
            <ThemeProvider theme={theme}>
                <TopBar></TopBar>
                {classObject ? (
                    <div>
                        <Box className="rounded-lg p-6 mb-6 text-center">
                            <Typography variant='h4' gutterBottom>{classObject.name}</Typography>
                            <Typography variant='subtitle1'>{classObject.department} - {classObject.number}</Typography>
                        </Box>
                        <Grid container spacing={3}>
                            {classPosts.map((post, index) => {
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

export default ClassPage