import React, { useState } from 'react';
import { TextareaAutosize, FormControl, FormLabel, OutlinedInput, Button, Stack, Box } from '@mui/material';
import { useGlobalContext } from '../Context/GlobalContext';

const OutlinedTextarea = ({post, setPost}) => {
    const {user} = useGlobalContext()
    const [isFocused, setIsFocused] = useState(false);
    const [text, setText] = useState("")


    const updatePost = async () => {
        await fetch(`http://localhost:3001/post/${post._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(post),
        });
    }
    
    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => {
        if (!text) setIsFocused(false) 
    }

    const handleCancel = () => {
        setText("")
        setIsFocused(false)
    }

    const handleSubmit = () => {
        const newComment = {
            comment: text,
            username: user.username,
            votes: 0,
            likedBy: [],
            dislikedBy: []
        }
        const newPost = post
        newPost.comments = [newComment, ...newPost.comments]
        updatePost()
        setPost(newPost)
        setText("")
        setIsFocused(false)
    }
    return (
        <FormControl variant="outlined" fullWidth>
        <OutlinedInput
            inputComponent={TextareaAutosize}
            placeholder="Comment Text"
            notched 
            inputProps={{
            minRows: 2, 
            }}
            onFocus={handleFocus}
            onBlur={handleBlur}
            value={text}
            onChange={(e) => setText(e.target.value)}
        />
        {isFocused && (
             <Box display="flex" justifyContent="flex-end" sx={{ mt: 1 }}>
                <Button variant="outlined" onClick={handleCancel}>Cancel</Button>
                <Button variant="contained" onClick={handleSubmit} disabled={!text || !user.username} sx={{ ml : 1 }}>Submit</Button>
            </Box>
        )}
        </FormControl>
    )
}

export default OutlinedTextarea;