import { ThemeProvider } from '@emotion/react'
import React, {useEffect, useState} from 'react'
import TopBar from '../Components/TopBar'
import UserModal from '../Components/UserModal'
import { useGlobalContext } from '../Context/GlobalContext'
import { useNavigate, useParams } from 'react-router-dom'
import { Box, Grid, Typography, TextField, Button} from '@mui/material'
import PostCard from '../Components/PostCard'

const CPage = () => {
    const {theme, isModalOpen, setIsModalOpen, searched, setSearched, cPosts, cObject, setCPosts, setCObject} = useGlobalContext()
    const {cName} = useParams()
    const [announcement, setAnnouncement] = useState('')
    const [isEditing, setIsEditing] = useState(false)
    const [isSnackOpen, setIsSnackOpen] = useState(false)  // Added state for Snackbar
    const [snackMessage, setSnackMessage] = useState('')

    const getClub = async () => {
        const response = await fetch(`http://localhost:3001/c/${cName}`)
        const object = await response.json()
        setCObject(object.data)
        setCPosts(object.posts) //sort pins
        setSearched(true)
        if (object.data.announcement) {
            setAnnouncement(object.data.announcement)  // Set fetched announcement
        }
    }

    /*const saveAnnouncement = async () => {
        // Send the announcement data to the server
        const response = await fetch(`http://localhost:3001/c/${cName}/announcement`, {
            method: "PUT",  // Use PUT if you are updating an existing announcement; POST if creating a new one
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ announcement }),  // Send the announcement text
        });
    
        const doc = await response.json();
    
        if (doc.message === 'Announcement saved successfully') {
            setIsEditing(false);  // Switch back to view mode after saving
            setIsSnackOpen(true);  // Open snack bar (assuming it's part of your logic)
            setSnackMessage('Announcement saved successfully');
        } else {
            setIsSnackOpen(true);  // Open snack bar in case of error
            setSnackMessage('Error saving announcement. Please try again.');
        }
    }; */

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
        }, [searched, cPosts])

    return (
        <div>
            <ThemeProvider theme={theme}>
                <TopBar/>
                {cObject? (
                    <div>
                        {/* link/announcement box
                        <Box className="rounded-lg p-6 mb-6 text-center" sx={{ backgroundColor: 'lightgrey' }}>
                            <Typography variant='h6' gutterBottom>Announcements</Typography>
                            
                            {isEditing ? (
                                <TextField
                                    value={announcement}
                                    onChange={(e) => setAnnouncement(e.target.value)}
                                    multiline
                                    rows={3}
                                    fullWidth
                                    variant="outlined"
                                    placeholder="Edit here..."
                                />
                            ) : (
                                <Typography variant="body1">{announcement || "No announcement yet."}</Typography>
                            )}

                            {isEditing ? (
                                <Button 
                                    variant="contained" 
                                    color="primary" 
                                    onClick={saveAnnouncement}
                                    sx={{ marginTop: 2 }}
                                >
                                    Save
                                </Button>
                            ) : (
                                <Button 
                                    variant="outlined" 
                                    color="primary" 
                                    onClick={() => setIsEditing(true)} 
                                    sx={{ marginTop: 2 }}
                                >
                                    Edit
                                </Button>
                            )}
                        </Box> */}

                        <Box className="rounded-lg p-6 mb-6 text-center">
                            <Typography variant='h4' gutterBottom>{cObject.name}</Typography>
                            {cObject.president ? (
                                <Typography variant='subtitle1'>President: {cObject.president}</Typography>
                            ) : (
                                <Typography variant='subtitle1'>{cObject.department} - {cObject.number}</Typography>
                            )}
                            
                        </Box>
                        <Grid container spacing={3}>
                            {cPosts.map((post, index) => {
                                return (
                                    <Grid item xs={12} key={index}>
                                        <PostCard post={post}/>
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