import React from 'react'
import { Typography, Box, Card, CardContent, IconButton } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import PinIcon from '@mui/icons-material/PushPin'
import { useNavigate } from 'react-router-dom'
import { useGlobalContext } from '../Context/GlobalContext'

const PostCard = ({ post, hidepin, minimal = false }) => {
    const navigate = useNavigate()
    const { user, setIsSnackOpen, setSnackMessage } = useGlobalContext()

    const handleDelete = async () => {
        const response = await fetch(`http://localhost:3001/post/${post._id}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(post),
        })
        const doc = await response.json()
        if (doc.message === 'Post deleted successfully') {
            setIsSnackOpen(true)
            setSnackMessage('Post deleted successfully, you may have to refresh to see it filtered out')
        }
    }

    const handlePin = async () => {
        if (!user?.username) {
            setIsSnackOpen(true)
            setSnackMessage('You must be logged in to pin a post!')
            return
        }
        const newpost = {...post, pin: !post.pin }
        const response = await fetch(`http://localhost:3001/post/${post._id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newpost),
        })
        const doc = await response.json()
        if (doc.message.includes('pinned')) {
            setIsSnackOpen(true)
            setSnackMessage(doc.message)
        }
    }

    const getFirstLine = (text = '') => {
        return text.split('\n')[0].split('. ')[0] + (text.length > 100 ? '...' : '')
    }

    return (
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent>
                <Typography variant='h6'>{post.title}</Typography>
                <Typography variant='body2' color='textSecondary'>
                    {post.class || post.club || 'No Group Specified'}
                </Typography>
                <Typography variant='caption' color='textSecondary' gutterBottom>
                    {post.username}
                </Typography>
                
                {/* minimal function here */}
                <Typography variant='body2' color='textSecondary' gutterBottom>
                    {minimal ? getFirstLine(post.text) : post.text}
                </Typography>

                <Box sx={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                    <Typography variant='body2'>Upvotes: {post.votes}</Typography>
                    <Typography variant='body2'>Comments: {post?.comments?.length}</Typography>
                </Box>

                <Box sx={{ mt: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', gap: '1rem' }}>
                        {!hidepin && user?.username && (
                            <IconButton onClick={handlePin} aria-label="pin">
                                <PinIcon color={post.pin ? "error" : "action"} />
                            </IconButton>
                        )}
                        <IconButton onClick={() => navigate(`/post/${post._id}`)}>
                            <ArrowForwardIcon />
                        </IconButton>
                    </Box>

                    {user?.username === post.username && (
                        <IconButton onClick={handleDelete} aria-label="delete">
                            <DeleteIcon />
                        </IconButton>
                    )}
                </Box>
            </CardContent>
        </Card>
    )
}

export default PostCard
