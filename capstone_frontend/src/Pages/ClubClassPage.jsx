import React, {useState, useEffect} from 'react'
import { useGlobalContext } from '../Context/GlobalContext'
import { ThemeProvider } from '@emotion/react'
import TopBar from '../Components/TopBar'
import UserModal from '../Components/UserModal'
import { FormControl, OutlinedInput, TextareaAutosize, Box, Button, Snackbar } from '@mui/material'

const ClubClassPage = () => {
    const {theme, isModalOpen, setIsModalOpen, user } = useGlobalContext()
    const [classDepartment, setClassDepartment] = useState("")
    const [newClassName, setNewClassName] = useState("")
    const [newClassNum, setNewClassNum] = useState(2500)
    const [isSnackOpen, setIsSnackOpen] = useState(false)
    const [snackMessage, setSnackMessage] = useState("")
    const [clubName, setClubName] = useState("")
    const [clubDescription, setClubDescription] = useState("")
    const [clubPresident, setClubPresident] = useState("")
    //TODO make club president a select yourself or autocomplete to select from users?
    //make autocomplete for other important people??
    //add club to search and create post page now


    const handleSubmitClass = async () => {
        const newClass = {
            name : newClassName,
            department: classDepartment,
            number: newClassNum
        }
        const response = await fetch('http://localhost:3001/class/add',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                },
                body: JSON.stringify(newClass),
        })
        if (!response.ok) {
            setSnackMessage('Error creating class')
            setIsSnackOpen(true)
            throw new Error(`Error: ${response.statusText}`);
        }
        setSnackMessage('Class created successfully')
        setIsSnackOpen(true)
        const result = await response.json()
    }

    const handleSubmitClub = async () => { 
        const newClass = {
            name : clubName,
            description: clubDescription,
            creater: user.username,
            president: clubPresident,
            importantPeople: [],
        }
        const response = await fetch('http://localhost:3001/club/add',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                },
                body: JSON.stringify(newClass),
        })
        if (!response.ok) {
            setSnackMessage('Error creating club')
            setIsSnackOpen(true)
            throw new Error(`Error: ${response.statusText}`);
        }
        setSnackMessage('Club created successfully')
        setIsSnackOpen(true)
        const result = await response.json()
    }

    useEffect(() => {
            if (!user.verified) {
                setSnackMessage('Must be verified to create posts. You can resend verification email in your profile page.')
                setIsSnackOpen(true)
            }
    }, [user])

    return (
        <div>
            <ThemeProvider theme={theme}>
                <TopBar></TopBar>
                <UserModal isOpen={isModalOpen} setIsOpen={setIsModalOpen}></UserModal>
                <div class="grid grid-cols-2 divide-x-2 divide-black">
                    <div class="col-span-1 mr-12">
                        <FormControl fullWidth>
                            <h1 className="text-3xl font-bold mt-1 ml-1">Create Club</h1>
                            <h3 className="text-xl mt-8 ml-1">Name</h3>
                            <OutlinedInput 
                                className='ml-1'
                                inputComponent={TextareaAutosize} 
                                placeholder='Videogame Design, Esports, Tennis'
                                notched
                                inputProps={{minRows:1}}
                                value={clubName}
                                onChange={(e) => setClubName(e.target.value)}
                                >
                            </OutlinedInput>
                            <h3 className="text-xl mt-8 ml-1">Description</h3>
                            <OutlinedInput 
                                className='ml-1'
                                inputComponent={TextareaAutosize} 
                                placeholder='......'
                                notched
                                inputProps={{minRows:1}}
                                value={clubDescription}
                                onChange={(e) => setClubDescription(e.target.value)}
                                >
                            </OutlinedInput>
                            <h3 className="text-xl mt-8 ml-1">President</h3> 
                            <OutlinedInput 
                                className='ml-1'
                                inputComponent={TextareaAutosize} 
                                placeholder='Enter a name'
                                notched
                                inputProps={{minRows:1}}
                                value={clubPresident}
                                onChange={(e) => setClubPresident(e.target.value)}
                                >
                            </OutlinedInput>
                        </FormControl>
                        <Box display="flex" justifyContent="flex-begin" sx={{ mt: 3 }}>
                            <Button variant="outlined" onClick={() => {setClubName(""); setClubDescription(""); setClubPresident("")}}>Cancel</Button>
                            <Button variant="contained" disabled={(!user.username || !clubDescription || !clubName || !user.verified)} sx={{ ml : 1 }} onClick={() => handleSubmitClub()}>Submit</Button>
                        </Box>
                    </div>
                    <div class="col-span-1 mr-8">
                        <FormControl fullWidth>
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
                            <Button variant="contained" disabled={(!user.username || !classDepartment || !newClassName || !newClassNum || !user.verified)} sx={{ ml : 1 }} onClick={() => handleSubmitClass()}>Submit</Button>
                        </Box>
                    </div>
                </div>
                <Snackbar open={isSnackOpen} autoHideDuration={3000} onClose={() => setIsSnackOpen(false)} anchorOrigin={{vertical: 'bottom', horizontal: 'center'}} message={snackMessage}/>
            </ThemeProvider>
        </div>
    )
}

export default ClubClassPage