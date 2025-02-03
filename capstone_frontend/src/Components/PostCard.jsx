import React, {useState} from 'react'
import { Typography, Box, Card, CardContent, Grid, IconButton, CardHeader } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useNavigate } from 'react-router-dom'
import { useGlobalContext } from '../Context/GlobalContext'
import { Snackbar } from '@mui/material'

const PostCard = ({post}) => {
    const navigate = useNavigate()
    const {user, setIsSnackOpen, setSnackMessage} = useGlobalContext()
    

    const handleDelete = async () => {
        const response =  await fetch(`http://localhost:3001/post/${post._id}`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(post),
          });
        const doc = await response.json()
        if (doc.message == 'Post deleted successfully'){
            setIsSnackOpen(true)
            setSnackMessage('Post deleted successfully, you may have to refresh to see it filtered out')
        }
    }
    
    return (
        <div>
            <Card
                sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                
                <CardContent>
                    <Typography variant='h6'>{post.title}</Typography>
                    <Typography variant='caption' color='textSecondary' gutterBottom>{post.username}</Typography>
                    <Typography variant='body2' color='textSecondary' gutterBottom>{post.text}</Typography>
                    <Box
                        sx={{
                            mt: 'auto',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}
                    >
                        <Box sx={{ display: 'flex', gap: '1rem' }}>
                            <Typography variant='body-2'>Upvotes: {post.votes}</Typography>
                            <Typography variant='body-2'>Comments: {post?.comments?.length}</Typography>
                        </Box>
                        <Box>
                            <IconButton sx={{alignItems:'right'}} onClick={() => navigate(`/post/${post._id}`)}>
                                <ArrowForwardIcon/>
                            </IconButton>
                            {user.username == post.username && (
                                <IconButton
                                    sx={{
                                        alignItems:'right'
                                    }}
                                    onClick={() => handleDelete()}
                                    aria-label="delete"
                                >
                                    <DeleteIcon />
                                </IconButton>
                            )}
                        </Box>
                    </Box>
                </CardContent>
            </Card>
        </div>
    )
}

export default PostCard