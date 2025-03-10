import React, { useEffect, useState } from 'react'
import "../index.css"
import TopBar from '../Components/TopBar'
import { ThemeProvider } from '@emotion/react';
import { useGlobalContext } from '../Context/GlobalContext';
import Upvote from '../Components/Upvote';
import OutlinedTextarea from '../Components/TextArea';
import { useNavigate, useParams } from 'react-router-dom';
import UserModal from '../Components/UserModal'
import { IconButton } from '@mui/material';
import PinIcon from '@mui/icons-material/PushPin';

const ViewPostPage = () => {
    const {theme, isModalOpen, setIsModalOpen} = useGlobalContext()
    const [post, setPost] = useState({})
    const {_id} = useParams()
    const navigate = useNavigate()

    const getPost = async () => {
        const response = await fetch(`http://localhost:3001/post/${_id}`)
        const posts = await response.json()
        setPost(posts[0])
    }

    const handlePin = async () => {
        if (!user.username) {
            setIsSnackOpen(true);
            setSnackMessage('You must be logged in to pin a post!');
            return;
        }

        const newPost = { ...post, pin: !post.pin }
        const response = await fetch(`http://localhost:3001/post/${_id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newPost),
        });
        const doc = await response.json()
        if (doc.message === 'Post pinned successfully' || doc.message === 'Post unpinned successfully') {
            setPost(newPost) // Update local state to reflect the pinned status
        }
    }

    useEffect(() => {
        getPost()
    }, [])

    return (
        <div>
            <ThemeProvider theme={theme}>
            <TopBar></TopBar>
            {post.comments ? (
                <div class="grid grid-cols-10 gap-4 divide-x-2 divide-black ">      
                    <div class="col-span-1">01</div>
                    <div class="col-span-7 pt-2 pl-8 pr-8">
                        <div class="text-sm">{post.username}</div>
                        <div>
                            {post.class ? (
                                <div style={{display: 'flex'}}> 
                                    Class:&nbsp;
                                    <div class="hover:underline" onClick={() => navigate(`/c/${post.class}`)}>{post.class}</div>
                                </div>
                            ): (
                                <></>
                            )
                            }
                            {post.club ? (
                                <div style={{display: 'flex'}}>
                                    Club:&nbsp; <div class="hover:underline" onClick={() => navigate(`/c/${post.club}`)}>{post.club}</div>
                                </div>
                            ): (
                                <></>
                            )
                            }
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div className="text-3xl"><b>{post.title}</b></div>
                                
                                <IconButton onClick={handlePin} aria-label="pin">
                                    <PinIcon color={post.pin ? "error" : "action"} /> {/* Red pin if pinned */}
                                </IconButton>
                            </div>
                        <div class="pt-4 ">{post.text}</div>
                        <div class="pt-8 "><Upvote post={post} setPost={setPost} commentText={""}/></div>
                        <div class="pt-4"><b>Enter your comment:</b></div>
                        <OutlinedTextarea post={post} setPost={setPost}/>
                        <div class="text-1xl pt-4"> <b>Comments:</b></div>
                        {post.comments.map((comment, index) => {
                            return (
                                <div key={index}>
                                    <div class="text-sm pt-4">{comment.username}</div>
                                    <div>{comment.comment}</div>
                                    <div><Upvote post={post} setPost={setPost} commentText={comment.comment}/></div>
                                </div>    
                            )
                        })}
                    </div>
                    <div class="col-span-1">03</div>
                </div>
            ) : (
                <div>
                    loading....
                </div>
            )}
            <UserModal isOpen={isModalOpen} setIsOpen={setIsModalOpen}/>
            </ThemeProvider>
        </div>
    )
}

export default ViewPostPage