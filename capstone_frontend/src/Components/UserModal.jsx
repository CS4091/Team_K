import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import React, { useEffect, useState } from 'react'
import { useGlobalContext } from '../Context/GlobalContext';
// import axios from 'axios';
import { Snackbar } from '@mui/material'

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
  };
  
const UserModal = ({isOpen, setIsOpen}) => {
    const {user, setUser} = useGlobalContext()
    const [tempName, setTempName] = useState('')
    const [tempPass, setTempPass] = useState('')
    const [tempEmail, setTempEmail] = useState('')
    const [isSnackOpen, setIsSnackOpen] = useState(false)
    const [snackMessage, setSnackMessage] = useState("")
    const [create, setCreate] = useState(false)

    const handleSignIn = async () => {
        const response = await fetch("http://localhost:3001/user/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                usernameOrEmail: tempName,
                password: tempPass,
              }),
        })
        const data = await response.json();
        if (data.message == "User not found"){
            setSnackMessage("User not found")
            setIsSnackOpen(true)
        } else if (data.message == "Invalid credentials") {
            setSnackMessage("Incorrect pasword")
            setIsSnackOpen(true)
           
        } else if (data.message == "Login successful"){
            setSnackMessage("Login successful")
            setIsSnackOpen(true)
            setUser({
                username: data.username,
                userEmail: data.userEmail,
                userRoles: data.userRoles
            })
            setIsOpen(false)
        } else {
            setSnackMessage("Error logging in")
            setIsSnackOpen(true)
        }
    }


    const handleCreate = async () => {
        const response = await fetch("http://localhost:3001/user/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username: tempName,
                password: tempPass,
                email: tempEmail
              }),
        })
        const data = await response.json();
        if (data.message == "Username or email already exists"){
            setSnackMessage("A User with that name or email already exists")
            setIsSnackOpen(true)
        } else if (data.message == "User registered successfully") {
            setSnackMessage("Account Created successfully")
            setIsSnackOpen(true)
            setUser({
                username: data.username,
                userEmail: data.userEmail,
                userRoles: data.userRoles
            })
            setIsOpen(false)
        } else {
            setSnackMessage("Error creating account")
            setIsSnackOpen(true)
        }   
    }
    
    return (
        <div>
            <Modal open={isOpen} onClose={() => setIsOpen(false)}>
                <Box sx={style}>
                    {create ? (
                        <div>
                            <Typography id="modal-modal-title" variant="h4" component="h2">
                                Create Account
                            </Typography>
                            <h3>Username:</h3>
                            <input type="text" style={{'outline':'1px solid black'}} value={tempName} onChange={e => setTempName(e.target.value)} variant='outlined'/>
                            <h3>Email:</h3>
                            <input type="text" style={{'outline':'1px solid black'}} value={tempEmail} onChange={e => setTempEmail(e.target.value)} variant='outlined'/>
                            <h3>Password:</h3>
                            <input type="password" style={{'outline':'1px solid black'}} value={tempPass} onChange={e => setTempPass(e.target.value)} variant='outlined'/>
                            <div style={{paddingTop: '1rem', display:'flex', justifyContent:'center'}}>
                                <Button style={{marginRight:'1rem'}} variant='outlined' onClick={() => setCreate(false)}>Sign in</Button>
                                <Button variant='contained' onClick={() => handleCreate()} disabled={!tempEmail || !tempName || !tempPass}>Create Account</Button>
                            </div>
                        </div>
                    ):(
                        <div>
                            <Typography id="modal-modal-title" variant="h4" component="h2">
                                Sign in
                            </Typography>
                            <h3>Username or Email:</h3>
                            <input type="text" style={{'outline':'1px solid black'}} value={tempName} onChange={e => setTempName(e.target.value)} variant='outlined'/>
                            <h3>Password:</h3>
                            <input type="password" style={{'outline':'1px solid black'}} value={tempPass} onChange={e => setTempPass(e.target.value)} variant='outlined'/>
                            <div style={{paddingTop: '1rem', display:'flex', justifyContent:'center'}}>
                                <Button style={{marginRight:'1rem'}} variant='contained' onClick={() => handleSignIn()}>Sign in</Button>
                                <Button variant='outlined' onClick={() => setCreate(true)}>Create Account</Button>
                            </div>
                        </div>
                    )}
                </Box>
            </Modal>
            <Snackbar open={isSnackOpen} autoHideDuration={3000} onClose={() => setIsSnackOpen(false)} anchorOrigin={{vertical: 'bottom', horizontal: 'center'}} message={snackMessage}/>
        </div>
    )
}

export default UserModal
