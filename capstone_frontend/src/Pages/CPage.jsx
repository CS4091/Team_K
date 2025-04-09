import { ThemeProvider } from '@emotion/react'
import React, {useEffect, useState} from 'react'
import TopBar from '../Components/TopBar'
import UserModal from '../Components/UserModal'
import { useGlobalContext } from '../Context/GlobalContext'
import { useNavigate, useParams } from 'react-router-dom'
import { Box, Grid, Typography, TextField, Button, Switch, FormControlLabel} from '@mui/material'
import PostCard from '../Components/PostCard'

const CPage = () => {
    const {theme, isModalOpen, setIsModalOpen, searched, setSearched, cPosts, cObject, setCPosts, setCObject} = useGlobalContext()
    const {cName} = useParams()
    const [announcement, setAnnouncement] = useState('')
    const [isEditing, setIsEditing] = useState(false)
    const [editedTitle, setEditedTitle] = useState('')
    const [editedContent, setEditedContent] = useState('')
    const [isSnackOpen, setIsSnackOpen] = useState(false)
    const [snackMessage, setSnackMessage] = useState('')
    const [isGridView, setIsGridView] = useState(true)
    

    const getClub = async () => {
        const response = await fetch(`http://localhost:3001/c/${cName}`)
        const object = await response.json()
        setCObject(object.data)
        setCPosts(object.posts) //sort pins
        setSearched(true)
        if (object.data.announcement) {
            setAnnouncement(object.data.announcement)
            setEditedTitle(object.data.name)
            setEditedContent(object.data.announcement)
        }
    }
    const handleSave = () => {
        setAnnouncement(editedContent)
        setIsEditing(false)
        setSnackMessage('updated announcement! :)')
        setIsSnackOpen(true)
    }

    const handleViewToggle = () => {
        setIsGridView(prevState => !prevState);
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
        }, [searched, cPosts])

    return (
        <div>
            <ThemeProvider theme={theme}>
                <TopBar/>
                {cObject? (
                    <div>
                        <Box className="rounded-lg p-6 mb-6 text-center">
                            <Typography variant='h4' gutterBottom>{cObject.name}</Typography>
                            {cObject.president ? (
                                <Typography variant='subtitle1'>President: {cObject.president?.username}</Typography>
                            ) : (
                                <Typography variant='subtitle1'>{cObject.department} - {cObject.number}</Typography>
                            )}
                            
                        </Box>

                        <Box className="rounded-lg p-6 mb-6" border={3} borderColor="grey.500">
                            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center">
                                <Typography variant="h5" align="center" gutterBottom></Typography>
                                {isEditing ? (
                                    <div>
                                        <TextField
                                            label="Title"
                                            variant="outlined"
                                            fullWidth
                                            value={editedTitle}
                                            onChange={(e) => setEditedTitle(e.target.value)}
                                            margin="normal"
                                        />
                                        <TextField
                                            label="Content"
                                            variant="outlined"
                                            fullWidth
                                            multiline
                                            rows={4}
                                            value={editedContent}
                                            onChange={(e) => setEditedContent(e.target.value)}
                                            margin="normal"
                                        />
                                        <Box mt={2}>
                                            <Button onClick={handleSave} variant="contained" color="primary">Save</Button>
                                        </Box>
                                    </div>
                                ) : (
                                    <div>
                                        <Typography variant="h6">{editedTitle}</Typography>
                                        <Typography>{editedContent}</Typography>
                                        <Box mt={2}>
                                            <Button onClick={() => setIsEditing(true)} variant="outlined" color="primary">Edit</Button>
                                        </Box>
                                    </div>
                                )}
                            </Box>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                            <Typography variant="body1" sx={{ marginRight: '10px' }}>List View</Typography>
                            <FormControlLabel
                                control={<Switch checked={isGridView} onChange={handleViewToggle} />}
                                label="Grid View"
                             />
                        </Box>

                        {isGridView ? (
                            <Grid container spacing={3}>
                                {cPosts.map((post, index) => {
                                    return (
                                        <Grid item xs={12} sm={6} md={4} key={index}>
                                            <PostCard post={post} />
                                        </Grid>
                                    )
                                })}
                            </Grid>
                        ) : (
                            <Box>
                                {cPosts.map((post, index) => (
                                    <Box key={index} mb={3}>
                                        <PostCard post={post} />
                                    </Box>
                                ))}
                            </Box>
                        )}
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