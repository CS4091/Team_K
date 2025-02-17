import React, { useEffect, useState } from 'react'
import { useGlobalContext } from '../Context/GlobalContext'
import { ThemeProvider } from '@emotion/react'
import TopBar from '../Components/TopBar'
import { OutlinedInput, TextareaAutosize, Box, Button, Select, MenuItem, FormControl, Snackbar } from '@mui/material'
import UserModal from '../Components/UserModal'
// import { Snackbar } from '@mui/material'


export const CreatePage = () => {
    const {theme, isModalOpen, setIsModalOpen, user, allClasses, setAllClasses} = useGlobalContext()
    const [title, setTitle] = useState("")
    const [text, setText] = useState("")
    const [className, setClassName] = useState("")
    const [club, setClub] = useState("")
    const [isSnackOpen, setIsSnackOpen] = useState(false)
    const [snackMessage, setSnackMessage] = useState("")

    const handleSubmit = async () => {
        const newPost = {
            username: user.username,
            title: title,
            text: text,
            class : className,
            club: club
        }
        const response = await fetch('http://localhost:3001/post', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify(newPost),
        });
    
        if (!response.ok) {
            setSnackMessage('Error creating post')
            setIsSnackOpen(true)
            throw new Error(`Error: ${response.statusText}`);
        }
        setSnackMessage('Post created successfully')
        setIsSnackOpen(true)
        const result = await response.json();

    }


    return (
        <div>
            <ThemeProvider theme={theme}>
                <TopBar></TopBar>
                <div style={{padding:'2%'}}>
                {/* <div class="grid grid-cols-2 divide-x-2 divide-black">
                    <div class="col-span-1 mr-12"> */}
                    <FormControl fullWidth>
                        <h1 className="text-3xl font-bold mt-1">Create Post</h1>
                        <h3 className="text-xl mt-8">Title</h3>
                        <OutlinedInput 
                            inputComponent={TextareaAutosize} 
                            placeholder='Title text'
                            notched
                            inputProps={{minRows:1}}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            >
                        </OutlinedInput>
                        <h3 className="text-xl mt-8">Text</h3>
                        <OutlinedInput 
                            inputComponent={TextareaAutosize} 
                            placeholder='Post Text'
                            notched
                            inputProps={{minRows:2}}
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            >
                        </OutlinedInput>

                        <h3 className="text-xl mt-8">Class</h3>
                        <Select         //TODO: Change to autocomplete
                            id="classes-select"
                            value={className}
                            onChange={(e) => setClassName(e.target.value)}
                        >
                            {allClasses.map(tempClass => {
                                return(
                                    <MenuItem value={tempClass.name}>{tempClass.name}</MenuItem>
                                )
                                
                            })}
                        </Select>
                    </FormControl>
                        <Box display="flex" justifyContent="flex-begin" sx={{ mt: 3 }}>
                            <Button variant="outlined" onClick={() => {setText(""); setTitle("")}}>Cancel</Button>
                            <Button variant="contained" disabled={(!user.username || !text || !title)} sx={{ ml : 1 }} onClick={() => handleSubmit()}>Submit</Button>
                        </Box>
                    </div>
                    {/* <div class="col-span-1 mr-8"> */}
                    {/* <FormControl fullWidth>
                        <h1 className="text-3xl font-bold mt-1 ml-1">Create Class</h1>
                        <h3 className="text-xl mt-8 ml-1">Department</h3>
                        <OutlinedInput 
                            className='ml-1'
                            inputComponent={TextareaAutosize} 
                            placeholder='Computer Science, Mechanical Engineering'
                            notched
                            inputProps={{minRows:1}}
                            value={classDepartment}
                            onChange={(e) => setClassDepartment(e.target.value)}
                            >
                        </OutlinedInput>
                        <h3 className="text-xl mt-8 ml-1">Class Name</h3>
                        <OutlinedInput 
                            className='ml-1'
                            inputComponent={TextareaAutosize} 
                            placeholder='Algorithms, Digital Logic'
                            notched
                            inputProps={{minRows:1}}
                            value={newClassName}
                            onChange={(e) => setNewClassName(e.target.value)}
                            >
                        </OutlinedInput>
                        <h3 className="text-xl mt-8 ml-1">Class Number</h3>
                        <OutlinedInput 
                            className='ml-1'
                            inputComponent={TextareaAutosize} 
                            placeholder='5200, 4090'
                            notched
                            inputProps={{minRows:1}}
                            value={newClassNum}
                            onChange={(e) => setNewClassNum(e.target.value)}
                            >
                        </OutlinedInput>
                        </FormControl>
                        <Box display="flex" justifyContent="flex-begin" sx={{ mt: 3 }}>
                            <Button variant="outlined" onClick={() => {setClassDepartment(""); setNewClassName(""); setNewClassNum(2500)}}>Cancel</Button>
                            <Button variant="contained" disabled={(!user.username || !classDepartment || !newClassName || !newClassNum)} sx={{ ml : 1 }} onClick={() => handleSubmitClass()}>Submit</Button>
                        </Box>
                    </div>
                </div> */}
               
                <UserModal isOpen={isModalOpen} setIsOpen={setIsModalOpen}/>
                <Snackbar open={isSnackOpen} autoHideDuration={3000} onClose={() => setIsSnackOpen(false)} anchorOrigin={{vertical: 'bottom', horizontal: 'center'}} message={snackMessage}/>
            </ThemeProvider>
        </div>
    )
}
