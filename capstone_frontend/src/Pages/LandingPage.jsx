import React, { useEffect, useState } from 'react'
import { useGlobalContext } from '../Context/GlobalContext'
import { ThemeProvider } from '@emotion/react'
import TopBar from '../Components/TopBar'
import UserModal from '../Components/UserModal'
import PostCard from '../Components/PostCard'
import { Typography, Box, Grid, TextField, Button } from '@mui/material'

const LandingPage = () => {
    //use javascript up here
    const {theme, isModalOpen, setIsModalOpen} = useGlobalContext()
    const [recentPosts, setRecentPosts] = useState([])
    const [totalPosts, setTotalPosts] = useState(0);
    const [postCount, setPostCount] = useState(4)
    const [searchText, setSearchText] = useState("")

    const getRecentPosts = async (count) => {
        const response = await fetch(`http://localhost:3001/posts/getRecent?limit=${count}`)
        const doc = await response.json()
        if (doc.posts && Array.isArray(doc.posts)) {
            setRecentPosts(doc.posts);
            setTotalPosts(doc.total);
        } else {
            console.error("Invalid API response:", doc);
        }
        
    }

    const handleSearch = async () => {
        if (!searchText.trim()) return
        const response = await fetch(`http://localhost:3001/search?query=${searchText}`)
        const data = await response.json()
        setRecentPosts(data)
    }

    const handleLoadMore = () => {
        if (postCount < totalPosts) {
            const newCount = postCount + 4;
            setPostCount(newCount);
            getRecentPosts(newCount);
        }
    };

    useEffect(() => {
        getRecentPosts(postCount)
    }, [postCount])
    
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
                <Typography variant="h6">Questions for everything S&T related</Typography>
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
            {recentPosts.length > 0 ? (
                <>
                    <Grid container spacing={3}>
                        {recentPosts.map((post, index) => (
                            <Grid item xs={12} key={index}>
                                <PostCard post={post} />
                            </Grid>
                        ))}
                    </Grid>
                    {postCount < totalPosts ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
                            <Button variant="contained" 
                            sx={{
                                backgroundColor: theme.palette.primary.main,
                                color: theme.palette.primary.contrastText,
                                '&:hover': {
                                    backgroundColor: theme.palette.primary.dark
                                }
                            }}
                            onClick={handleLoadMore}>
                                Load More
                            </Button>
                        </Box>
                    ) : (
                        <Typography sx={{ textAlign: 'center', marginTop: 2, fontStyle: 'italic' }}>
                            No more posts found.
                        </Typography>
                    )}
                </>
            ) : (
                <Typography>No posts found.</Typography>
            )}    
                
            </ThemeProvider>
            <UserModal isOpen={isModalOpen} setIsOpen={setIsModalOpen}/>
        </div>
    );
}


export default LandingPage
