import React, { useEffect, useState } from 'react'
import { useGlobalContext } from '../Context/GlobalContext'
import { Autocomplete, Box, Modal, Typography, TextField, Button } from '@mui/material'

const SettingsModal = ({isOpen, setIsOpen}) => {

    //TODO:DECIDE IF we shoul duse object for club president: might not be a bad idea
    //TODO: ACTUALLY ADD PERMISSIONS TO CALENDAR AN STUFF
    const {user, cObject, setCObject} = useGlobalContext()
    const [allUsers, setAllUsers] = useState([])
    const [newPresident, setNewPresident] = useState(null)
    const [newImportantPeople, setNewImportantPeople] = useState([])

    const canChangePresident = user?.username === cObject?.president || user?.username === cObject?.creator

    const getAllUsers = async () => {
        const response = await fetch(`http://localhost:3001/users/getAll`)
        const doc = await response.json()
        // console.log(doc)
        setAllUsers(doc)
    }

    useEffect(() => {
        if (isOpen) {
            getAllUsers()
            setNewPresident(cObject?.president || null)
            setNewImportantPeople(cObject?.importantPeople || [])
        }
    }, [isOpen])

    const handleSave = async () => {
        const currentIds = cObject.importantPeople?.map(p => p._id) || []
        const newAdditions = newImportantPeople.filter(p => !currentIds.includes(p._id))

        const body = {
            ...(canChangePresident && { president: newPresident.username }),
            newImportantPeople: newAdditions
        }

        console.log(cObject)

        try {
            const res = await fetch(`http://localhost:3001/c/${cObject._id}/update`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            })
    
            if (res.ok) {
                const data = await res.json()
                // console.log(data)
                setCObject(data.updatedClub)
                setIsOpen(false)
            } else {
                console.error('Failed to update club')
            }
        } catch (err) {
            console.error(err)
        }
    }

    return (
        <div>
            <Modal open={isOpen} onClose={() => setIsOpen(false)}>
                <Box sx={{ width: 400, p: 4, bgcolor: 'background.paper', mx: 'auto', mt: 10, borderRadius: 2 }}>
                    <Typography variant="h6" gutterBottom>Club Settings</Typography>

                   {canChangePresident && 
                        <Autocomplete
                            options={allUsers}
                            getOptionLabel={(option) => option.username || ''}
                            value={newPresident}
                            onChange={(e, value) => setNewPresident(value)}
                            renderInput={(params) => <TextField {...params} label="President" />}
                            sx={{ mb: 2 }}
                        >
 
                        </Autocomplete>
                    }

                    <Autocomplete
                        multiple
                        options={allUsers}
                        getOptionLabel={(option) => option.username || ''}
                        value={newImportantPeople}
                        onChange={(e, value) => setNewImportantPeople(value)}
                        renderInput={(params) => <TextField {...params} label="Important People" />}
                    />
                    <Box mt={3} display="flex" justifyContent="space-between">
                        <Button variant="outlined" onClick={() => setIsOpen(false)}>Cancel</Button>
                        <Button variant="contained" onClick={handleSave}>Save</Button>
                    </Box>
                </Box>
            </Modal>
        </div>
    )
}

export default SettingsModal
