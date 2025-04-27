import { ThemeProvider } from '@emotion/react'
import React, {useEffect, useState} from 'react'
import TopBar from '../Components/TopBar'
import UserModal from '../Components/UserModal'
import { useGlobalContext } from '../Context/GlobalContext'
import { useNavigate, useParams } from 'react-router-dom'
import { Box, Grid, Typography, TextField, Button, IconButton} from '@mui/material'
import SettingsIcon from '@mui/icons-material/Settings'
import PostCard from '../Components/PostCard'
import SettingsModal from '../Components/SettingsModal'

const CPage = () => {
    const {theme, isModalOpen, setIsModalOpen, searched, setSearched, cPosts, cObject, setCPosts, setCObject, user} = useGlobalContext()
    const {cName} = useParams()
    const [loaded, setLoaded] = useState(false)
    const [announcement, setAnnouncement] = useState('')
    const [isEditing, setIsEditing] = useState(false)
    const [isSnackOpen, setIsSnackOpen] = useState(false)  // Added state for Snackbar
    const [snackMessage, setSnackMessage] = useState('')
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)
    const [canEditClub, setCanEditClub] = useState(false)

    const getClub = async () => {
        const response = await fetch(`http://localhost:3001/c/${cName}`)
        const object = await response.json()
        setCObject(object.data)
        setLoaded(true)
        setCPosts(object.posts)
        setSearched(true)
        if (object.data.announcement) {
            setAnnouncement(object.data.announcement)  // Set fetched announcement
        }
    }

    useEffect(() => {
            if (searched == false && cPosts.length == 0) {
                getClub()
            }else { //sorting based on if pinned
                setCPosts(prevPosts => 
                    [...prevPosts].sort((a, b) => {
                        return b.pin - a.pin;
                    })
                )
            }
        }, [cPosts])
    
    useEffect(() => {
        if (cObject.name) {
            if ( user.username === cObject.president.username ||
                user.username === cObject.creator ||
                (cObject.importantPeople?.some(p => p.username === user.username))){
                    setCanEditClub(true)
                }
        }
    }, [cObject])

    
    return (
        <div>
            <ThemeProvider theme={theme}>
                <TopBar/>
                {cObject.name ? (
                    <div>
                        <Box className="rounded-lg p-6 mb-6 text-center relative">
                            <Typography variant='h4' gutterBottom>{cObject?.name}</Typography>
                            {canEditClub && (
                                <IconButton 
                                    onClick={() => setIsSettingsOpen(true)} 
                                    sx={{ position: 'absolute', top: 10, right: 10 }}
                                >
                                    <SettingsIcon />
                                </IconButton>
                            )}
                            {cObject.president ? (
                                <Typography variant='subtitle1'>President: {cObject.president.username}</Typography>
                            ) : (
                                <Typography variant='subtitle1'>{cObject.department} - {cObject.number}</Typography>
                            )}
                            
                        </Box>
                        <Grid container spacing={3}>
                            {cPosts.map((post, index) => {
                                return (
                                    <Grid item xs={12} key={index}>
                                        <PostCard post={post} hidepin={!canEditClub}/>
                                    </Grid>
                                )
                            })}
                        </Grid>
                    </div>
                ) : (
                    <>Loading...</>
                )} 
                <UserModal isOpen={isModalOpen} setIsOpen={setIsModalOpen}/>
                <SettingsModal isOpen={isSettingsOpen} setIsOpen={setIsSettingsOpen} />
            </ThemeProvider>
        </div>
    )
}

export default CPage
