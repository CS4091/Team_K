import React, { useEffect, useState } from 'react'
import { useGlobalContext } from '../Context/GlobalContext'
import { ThemeProvider } from '@emotion/react'
import TopBar from '../Components/TopBar'
import UserModal from '../Components/UserModal'
import PostCard from '../Components/PostCard'
import { Typography, Box, Grid, TextField, Button } from '@mui/material'

const LandingPage = () => {
    const {theme, isModalOpen, setIsModalOpen, user} = useGlobalContext()
    const [recentPosts, setRecentPosts] = useState([])
    const [searchText, setSearchText] = useState("")

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
                    textAlgin: 'center',
                    marginTop: '1rem',
                    marginBottom: '2rem'
                }}            
            >
                <Typography variant="h1">Miner Board</Typography>
                <Typography variant="h6">Questions for everying S&T related</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, marginBottom: 2 }}>
                <TextField
                    variant="outlined"
                    fullWidth
                    placeholder="Search posts..."
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                    />
                <Button variant="contained" color="primary" onClick={handleSearch}>Search</Button>
            </Box>

            <Typography variant="h6">Posts:</Typography>
            {recentPosts ? (
                <Grid container spacing={3}>
                {recentPosts.map((post, index) => {
                    return (
                        <Grid item xs={12} key={index}>
                            <PostCard post={post} hidepin={true} />
                        </Grid>
                    )
                })}
                </Grid>
            ) : (<>
            </>)}
           
            
            
            </ThemeProvider>
            <UserModal isOpen={isModalOpen} setIsOpen={setIsModalOpen}/>
        </div>
    )
}

export default LandingPage