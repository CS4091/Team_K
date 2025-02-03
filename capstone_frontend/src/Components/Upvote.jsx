import { Button, } from '@mui/material'
import {ThumbUpOffAlt, ThumbUpAlt, ThumbDownAlt, ThumbDownOffAlt} from '@mui/icons-material';
import React, { useState } from 'react'

const Upvote = ({post, setPost, commentText}) => {
  const [liked, setLiked] = useState(false)
  const [disliked, setDisliked] = useState(false)
    
  const updatePost = async () => {
    await fetch(`http://localhost:3001/post/${post._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(post),
    });
  }

  const changeLiked = () => {
    let newVotes = commentText ? post.comments.filter(comment => comment.comment == commentText)[0].votes : post.votes
    if (liked  == true){
      newVotes = newVotes - 1
    }else{
      if(disliked) newVotes = newVotes + 1
      newVotes = newVotes +  1
    }
    setLiked(!liked)
    if (disliked) {
      setDisliked(false)
    }
    const newPost = post
    if (commentText) {
      newPost.comments.filter(comment => comment.comment == commentText)[0].votes = newVotes
    } else{
      newPost.votes = newVotes
    }
    setPost(newPost)
    updatePost()
  }


  const changeDisLiked = () => {
    let newVotes = commentText ? post.comments.filter(comment => comment.comment == commentText)[0].votes : post.votes
    if (disliked  == false){
      if(liked) newVotes = newVotes - 1
      newVotes = newVotes - 1
    }else{
      newVotes = newVotes +  1
    }
    setDisliked(!disliked)
    if (liked) {
      setLiked(false)
    }
    const newPost = post
    if (commentText) {
      newPost.comments.filter(comment => comment.comment == commentText)[0].votes = newVotes
    } else{
      newPost.votes = newVotes
    }
    setPost(newPost)
    updatePost()
  }

  const getCommentVotes = () => {
    const filteredComment = post.comments.filter(comment => comment.comment == commentText)
    return filteredComment[0].votes
  }

  return (
    <div style={{display:"flex"}}>
      <Button color='inherit' startIcon={liked ? <ThumbUpAlt/> : <ThumbUpOffAlt/>} variant='outlined' onClick={() =>changeLiked()}></Button>
      <h3 style={{marginLeft: '10px', marginRight:'10px'}}>{commentText ? getCommentVotes() : post.votes}</h3>
      <Button color='inherit' startIcon={disliked ? <ThumbDownAlt/> : <ThumbDownOffAlt/>} variant='outlined' onClick={() => changeDisLiked()}></Button>
    </div>
  )
}

export default Upvote