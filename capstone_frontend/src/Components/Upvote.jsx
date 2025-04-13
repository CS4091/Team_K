import { Button, } from '@mui/material'
import {ThumbUpOffAlt, ThumbUpAlt, ThumbDownAlt, ThumbDownOffAlt} from '@mui/icons-material';
import React, { useEffect, useState } from 'react'
import { useGlobalContext } from '../Context/GlobalContext';

const Upvote = ({post, setPost, commentText}) => {
  const {user} = useGlobalContext()
  const [liked, setLiked] = useState(commentText ? post.comments.filter(comment => comment.comment == commentText)[0]?.likedBy?.includes(user.username) ? true : false : post?.likedBy?.includes(user?.username) ? true : false)
  const [disliked, setDisliked] = useState(commentText ? post.comments.filter(comment => comment.comment == commentText)[0]?.dislikedBy?.includes(user.username) ? true : false : post?.dislikedBy?.includes(user?.username) ? true : false)

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
    var newLikedBy = commentText ? post.comments.filter(comment => comment.comment == commentText)[0].likedBy : post.likedBy
    let newDislikedBy = commentText ? post.comments.filter(comment => comment.comment == commentText)[0].dislikedBy : post.dislikedBy
    if (liked  == true){
      newVotes = newVotes - 1
      newLikedBy = newLikedBy.filter(name => name !== user.username)
    }else{
      if(disliked) {
        newVotes = newVotes + 1
        newDislikedBy = newDislikedBy.filter(name => name !== user.username)
      }
      newVotes = newVotes +  1
      newLikedBy.push(user.username)
    }
    setLiked(!liked)
    if (disliked) {
      setDisliked(false)
    }
    const newPost = post
    if (commentText) {
      newPost.comments.filter(comment => comment.comment == commentText)[0].votes = newVotes
      newPost.comments.filter(comment => comment.comment == commentText)[0].likedBy = newLikedBy
      newPost.comments.filter(comment => comment.comment == commentText)[0].dislikedBy = newDislikedBy
    } else{
      newPost.votes = newVotes
      // console.log({newLikedBy})
      // console.log({newDislikedBy})
      newPost.likedBy = newLikedBy
      newPost.dislikedBy = newDislikedBy
      // console.log(newPost.likedBy)
      // console.log(newPost.dislikedBy)
    }
    // if (!commentText){
    //   // console.log({newLikedBy})
    //   newPost.liked = newLikedBy
    // }
    // console.log(newPost)
    setPost(newPost)
    updatePost()
  }


  const changeDisLiked = () => {
    let newVotes = commentText ? post.comments.filter(comment => comment.comment == commentText)[0].votes : post.votes
    var newLikedBy = commentText ? post.comments.filter(comment => comment.comment == commentText)[0].likedBy : post.likedBy
    let newDislikedBy = commentText ? post.comments.filter(comment => comment.comment == commentText)[0].dislikedBy : post.dislikedBy
    if (disliked  == false){
      if(liked) {
        newVotes = newVotes - 1
        newLikedBy = newLikedBy.filter(name => name !== user.username)
      }
      newVotes = newVotes - 1
      newDislikedBy.push(user.username)
    }else{
      newVotes = newVotes +  1
      newDislikedBy = newDislikedBy.filter(name => name !== user.username)
    }
    setDisliked(!disliked)
    if (liked) {
      setLiked(false)
    }
    const newPost = post
    if (commentText) {
      newPost.comments.filter(comment => comment.comment == commentText)[0].votes = newVotes
      newPost.comments.filter(comment => comment.comment == commentText)[0].likedBy = newLikedBy
      newPost.comments.filter(comment => comment.comment == commentText)[0].dislikedBy = newDislikedBy
    } else{
      newPost.votes = newVotes
      // console.log({newLikedBy})
      // console.log({newDislikedBy})
      newPost.likedBy = newLikedBy
      newPost.dislikedBy = newDislikedBy
      // console.log(newPost.likedBy)
      // console.log(newPost.dislikedBy)
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
      <Button color='inherit' startIcon={liked ? <ThumbUpAlt/> : <ThumbUpOffAlt/>} variant='outlined' onClick={() =>changeLiked()} disabled={!user.username}></Button>
      <h3 style={{marginLeft: '10px', marginRight:'10px'}}>{commentText ? getCommentVotes() : post.votes}</h3>
      <Button color='inherit' startIcon={disliked ? <ThumbDownAlt/> : <ThumbDownOffAlt/>} variant='outlined' onClick={() => changeDisLiked()} disabled={!user.username}></Button>
    </div>
  )
}

export default Upvote