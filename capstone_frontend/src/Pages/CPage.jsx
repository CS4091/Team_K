import { ThemeProvider } from '@emotion/react';
import React, { useEffect, useState } from 'react';
import TopBar from '../Components/TopBar';
import UserModal from '../Components/UserModal';
import { useGlobalContext } from '../Context/GlobalContext';
import { useParams } from 'react-router-dom';
import { Box, Grid, Typography, TextField, Button, Paper, IconButton } from '@mui/material';
import PostCard from '../Components/PostCard';
import SettingsModal from '../Components/SettingsModal'
import SettingsIcon from '@mui/icons-material/Settings'
import {Snackbar} from '@mui/material';

const CPage = () => {
  const {
    theme,
    isModalOpen,
    setIsModalOpen,
    searched,
    setSearched,
    cPosts,
    cObject,
    setCPosts,
    setCObject,
    user,
    setIsSnackOpen,
    setSnackMessage,
    isSnackOpen,
    snackMessage
  } = useGlobalContext();

  const { cName } = useParams();
  const [announcement, setAnnouncement] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [canEditClub, setCanEditClub] = useState(false)

  const getClub = async () => {
    const response = await fetch(`http://localhost:3001/c/${cName}`);
    const object = await response.json();
    setCObject(object.data);
    setCPosts(object.posts);
    setSearched(true);
    setAnnouncement(object.data.announcement || '');
  };

  const saveAnnouncement = async () => {
    const response = await fetch(`http://localhost:3001/c/${cName}/announcement`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ announcement })
    });

    const data = await response.json();
    if (data.message === "announcement has been contained successfuly") {
      setIsEditing(false);
    } else {
      setIsSnackOpen(true)
      setSnackMessage('Message failed to save')
    }
  };

    useEffect(() => {
      
            if (searched == false && cPosts.length == 0) {
                getClub()
                setAnnouncement('');
            }else { //sorting based on if pinned
                setCPosts(prevPosts => 
                    [...prevPosts].sort((a, b) => {
                        return b.pin - a.pin;
                    })
                )
            }
        }, [cPosts])
    
    useEffect(() => {
      setCanEditClub(false)
        if (cObject.president && user.username) {
            if ( user.username === cObject.president.username ||
                user.username === cObject.creator ||
                (cObject.importantPeople?.some(p => p.username === user.username))){
                    setCanEditClub(true)
                }
        }
    }, [cObject, user])

    
    return (
        <div>
            <ThemeProvider theme={theme}>
                <TopBar/>
                {cObject.name ? (
                    <div>
                        <Box className="rounded-lg p-6 mb-6 text-center relative">
                            <Typography variant='h4' gutterBottom>{cObject?.name}</Typography>
                            {canEditClub ? (
                                <IconButton 
                                    onClick={() => setIsSettingsOpen(true)} 
                                    sx={{ position: 'absolute', top: 10, right: 10 }}
                                >
                                    <SettingsIcon />
                                </IconButton>
                            ): (<></>)}
                            {cObject.president ? (
                                <Typography variant='subtitle1'>President: {cObject.president.username}</Typography>
                            ) : (
                                <Typography variant='subtitle1'>{cObject.department} - {cObject.number}</Typography>
                            )}
                            
                        </Box>
                         {/* Announcement Section */}
                        <Paper
                          elevation={3}
                          sx={{
                            width: '100%',
                            maxWidth: '100%',
                            px: 2,
                            py: 3,
                            mb: 4,
                            mx: 'auto',
                            border: '1px solid #ccc',
                            borderRadius: 2
                          }}
                        >
                          <Typography variant="h6" align="center" gutterBottom>
                            Announcements
                          </Typography>

                          {isEditing ? (
                            <Box>
                              <TextField
                                fullWidth
                                multiline
                                minRows={3}
                                variant="outlined"
                                value={announcement}
                                onChange={(e) => setAnnouncement(e.target.value)}
                              />
                              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                                <Button onClick={() => setIsEditing(false)} variant="outlined" color="secondary">
                                  Cancel
                                </Button>
                                <Button onClick={saveAnnouncement} variant="contained" color="primary">
                                  Save
                                </Button>
                              </Box>
                            </Box>
                          ) : (
                            <Box sx={{ px: 1 }}>
                              <Typography sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>
                                {announcement || "No announcements"}
                              </Typography>
                              {user?.username && canEditClub && (
                                <Button onClick={() => setIsEditing(true)} variant="outlined" size="small">
                                  edit
                                </Button>
                              )}
                            </Box>
                          )}
                        </Paper>
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
                <Snackbar open={isSnackOpen} autoHideDuration={3000} onClose={() => setIsSnackOpen(false)} anchorOrigin={{vertical: 'bottom', horizontal: 'center'}} message={snackMessage}/>
            </ThemeProvider>
        </div>
    )
}

export default CPage
