import React, { useEffect, useState } from 'react'
import "../index.css"
import TopBar from '../Components/TopBar'
import { ThemeProvider } from '@emotion/react';
import { useGlobalContext } from '../Context/GlobalContext';
import Upvote from '../Components/Upvote';
import OutlinedTextarea from '../Components/TextArea';
import { useNavigate, useParams } from 'react-router-dom';
import UserModal from '../Components/UserModal'
import { IconButton, Grid } from '@mui/material';
import PostCard from '../Components/PostCard'
import PinIcon from '@mui/icons-material/PushPin';

const ViewPostPage = () => {
    const {theme, isModalOpen, setIsModalOpen, cPosts, cObject, setCPosts, setCObject} = useGlobalContext()
    const [clubPost, setClubPosts] = useState([])
    const [clubObject, setClubObject] = useState({})
    const [classPosts, setClassPosts] = useState([])
    const [classObject, setClassObject] = useState({})
    const [post, setPost] = useState({})
    const {_id} = useParams()
    const navigate = useNavigate()

    const getPost = async () => {
        const response = await fetch(`http://localhost:3001/post/${_id}`)
        const posts = await response.json()
        setPost(posts[0])
        if ((!cPosts || !cObject.name) && (posts[0].class || posts[0].club) ){
            if (posts[0].class) {
                const response = await (await fetch(`http://localhost:3001/c/${posts[0].class}`)).json()
                setClassObject(response.data)
                setClassPosts(response.posts)
            }
            if (posts[0].club) {
                const response = await (await fetch(`http://localhost:3001/c/${posts[0].club}`)).json()
                setClubObject(response.data)
                setClubPosts(response.posts)
            }

        }
    }

    const handlePin = async () => {
        // delete the ! or remove the if statement if pin function should be allowed here
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
            setPost(newPost)
            setIsSnackOpen(true)
            setSnackMessage(doc.message)
        }
    }

    useEffect(() => {
        getPost()
    }, [_id])


    return (
        <div>
            <ThemeProvider theme={theme}>
            <TopBar></TopBar>
            {post?.comments ? (
                <div class="grid grid-cols-11 gap-4 divide-x-2 divide-black ">      
                    <div class="col-span-2">
                        <div class="pt-4"><b>Similar Posts:</b></div>
                        <hr class="h-px mb-8 bg-gray-200 border-0 dark:bg-gray-700"></hr>
                        {cPosts.length > 0 ? (
                            <>
                                {cPosts.map(cPost => {
                                    return (
                                        <div>
                                            <div class=" hover:underline" onClick={() => navigate(`/post/${cPost._id}`)}><b>{cPost.title}</b></div>
                                            <div class="truncate">{cPost.text}</div>
                                            <hr class="h-px my-8 bg-gray-200 border-0 dark:bg-gray-700"></hr>
                                        </div>
                                    )
                                })}
                            </>
                        ):(
                            
                            classPosts.length > 0 ? (
                                <>
                                    {classPosts.map(cPost => {
                                        return (
                                            <div>
                                                <div class=" hover:underline" onClick={() => navigate(`/post/${cPost._id}`)}><b>{cPost.title}</b></div>
                                                <div class="truncate">{cPost.text}</div>
                                                <hr class="h-px my-8 bg-gray-200 border-0 dark:bg-gray-700"></hr>
                                            </div>
                                        )
                                    })}
                                </>
                            ) : (
                                <>
                                    {clubPost.length > 0 ? (
                                        <>
                                        {clubPost.map(cPost => {
                                        return (
                                            <div>
                                                <div class=" hover:underline" onClick={() => navigate(`/post/${cPost._id}`)}><b>{cPost.title}</b></div>
                                                <div class="truncate">{cPost.text}</div>
                                                <hr class="h-px my-8 bg-gray-200 border-0 dark:bg-gray-700"></hr>
                                            </div>
                                        )
                                    })}
                                        </>
                                    ):(
                                        <>
                                            No Related Post found
                                        </>
                                    )}
                                </>
                            )
                        )}
                    </div>
                    <div class="col-span-7 pt-2 pl-8 pr-8">
                        <div class="text-sm">{post.username}</div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div className="text-3xl"><b>{post.title}</b></div>
                                
                                <IconButton onClick={handlePin} aria-label="pin">
                                    <PinIcon color={post.pin ? "error" : "action"} />
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
                    <div class="col-span-2">
                        <div>
                            {cObject.name ? (
                                <>
                                    {cObject.number ? (
                                        <div >
                                            <div class="font-bold text-lg" style={{display:'flex'}}>You are in:&nbsp;<div class="hover:underline" onClick={() => navigate(`/c/${post.class}`)}>{post.class}</div></div>
                                            <div>Number: {cObject.number}</div>
                                            <div>Department: {cObject.department}</div>

                                            {/* maybe do a list of other classes in same department */}
                                        </div>
                                        ): (
                                        <div>
                                            <div class="font-bold text-lg" style={{display:'flex'}}>You are in:&nbsp;<div class="hover:underline" onClick={() => navigate(`/c/${post.club}`)}>{post.club}</div></div>
                                            <div>President: {cObject.president}</div>
                                        </div>
                                        )
                                    } 
                                </>
                            ):(
                                <>
                                    {classObject.number ? (
                                        <div >
                                            <div class="font-bold text-lg" style={{display:'flex'}}>You are in:&nbsp;<div class="hover:underline" onClick={() => navigate(`/c/${post.class}`)}>{post.class}</div></div>
                                            <div>Number: {classObject.number}</div>
                                            <div>Department: {classObject.department}</div>
                                        </div>
                                    ):(
                                        <div>
                                            <div class="font-bold text-lg" style={{display:'flex'}}>You are in:&nbsp;<div class="hover:underline" onClick={() => navigate(`/c/${post.club}`)}>{post.club}</div></div>
                                            <div>President: {clubObject.president}</div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
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