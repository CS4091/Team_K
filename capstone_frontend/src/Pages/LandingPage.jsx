import React, { useEffect, useState } from 'react'
import { useGlobalContext } from '../Context/GlobalContext'
import { ThemeProvider } from '@emotion/react'
import TopBar from '../Components/TopBar'
import UserModal from '../Components/UserModal'
import PostCard from '../Components/PostCard'
import { Typography, Box, Grid, TextField, Button, Switch, FormControlLabel } from '@mui/material'
import {Snackbar} from '@mui/material'

const LandingPage = () => {
    const {theme, isModalOpen, setIsModalOpen, isSnackOpen, snackMessage, setIsSnackOpen} = useGlobalContext()
    const [recentPosts, setRecentPosts] = useState([])
    const [searchText, setSearchText] = useState("")
    const [isGridView, setIsGridView] = useState(true)

    const getRecentPosts = async () => {
        const response = await fetch("http://localhost:3001/posts/getRecent")
        const doc = await response.json()
        setRecentPosts(doc)
    }

    const handleSearch = async () => {
        if (!searchText.trim()) return
        const response = await fetch(`http://localhost:3001/search?query=${searchText}`)
        const data = await response.json()
        setRecentPosts(data)
    }

    const handleViewToggle = () => {
        setIsGridView(prevState => !prevState);
    }

    useEffect(() => {
        getRecentPosts()
    }, [])
    
    return (
        <div>
            <ThemeProvider theme={theme}>
            <TopBar></TopBar>
            <Box
                sx={{
                    height:'30vh',
                    display:'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: theme.palette.primary.main,
                    color: theme.palette.primary.contrastText,
                    textAlign: 'center',
                    marginTop: '1rem',
                    marginBottom: '2rem'
                }}            
            >
                <Typography variant="h1">Miner Board</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, marginBottom: 2, position: 'sticky', top: 0, zIndex: 10, backgroundColor: theme.palette.background.paper, padding: '10px 0',}}>
                <TextField
                    variant="outlined"
                    fullWidth
                    placeholder="Search posts..."
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                    />
                <Button variant="contained" color="primary" onClick={handleSearch}>Search</Button>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                <Typography variant="body1" sx={{ marginRight: '10px' }}>List View</Typography>
                <FormControlLabel
                    control={<Switch checked={isGridView} onChange={handleViewToggle} />}
                    label="Grid View"
                />
            </Box>

            <Typography variant="h6" sx={{ marginBottom: '1.5rem' }}>Posts:</Typography>
                {recentPosts.length > 0 ? (
                    isGridView ? (
                        <Grid container spacing={3}>
                            {recentPosts.map((post, index) => (
                                <Grid item xs={12} sm={6} md={4} key={index} sx={{ display: 'flex', flexDirection: 'column', marginBottom: '1rem' }}>
                                    <PostCard post={post} hidepin={true} minimal={true} />
                                </Grid>
                            ))}
                        </Grid>
                    ) : (
                        <Box>
                            {recentPosts.map((post, index) => (
                                <Box key={index} sx={{ display: 'flex', flexDirection: 'column', marginBottom: '1rem', border: '2px solid #ddd', borderRadius: '8px', padding: '10px' }}>
                                    <PostCard post={post} hidepin={true} minimal = {true}/>
                                </Box>
                            ))}
                        </Box>
                    )
                ) : (
                    <Typography>No posts available</Typography>
                )}

                <Snackbar open={isSnackOpen} autoHideDuration={3000} onClose={() => setIsSnackOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} message={snackMessage} />
                <UserModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} />
            </ThemeProvider>
        </div>
    )
}

export default LandingPage