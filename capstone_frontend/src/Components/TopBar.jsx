import React, { useState, useEffect } from 'react'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Icon from '@mdi/react';
import { mdiPickaxe } from '@mdi/js';
import { useNavigate } from 'react-router-dom'
import { Autocomplete, IconButton, Tooltip, TextField } from '@mui/material'
import { Add, Person } from '@mui/icons-material'
import { useGlobalContext } from '../Context/GlobalContext'
import { CalendarToday } from '@mui/icons-material';
import UserModal from './UserModal'
import MapIcon from '@mui/icons-material/Map';
import {Menu} from '@mui/material'
import{ MenuItem} from '@mui/material'


const TopBar = () => {
    const navigate = useNavigate()
    const {user, setIsModalOpen, setSearched, cPosts, setCPosts, allC} = useGlobalContext()

    const [selectedC, setSelectedC] = useState({})
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);

    const handleUserClick = () => {
        if (!user.username) {
            setIsModalOpen(true)
        } else{
            navigate(`/user/${user.username}`)
        }
      }

    const handleNavigate = () => {
        if (selectedC) {
            if(cPosts) {
                setCPosts([])
            }
            setSearched(false)
            navigate(`/c/${selectedC.name}`);
        }
    }

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
      };
      const handleClose = () => {
        setAnchorEl(null);
      };

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static">
                <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    <div class='grid grid-cols-4 gap-4'>
                        <div class='col-span-1' style={{'display':'flex'}}>
                            <Icon path={mdiPickaxe} size={1} />
                            <Button color="inherit" onClick={() => navigate('/')}>Miner Board</Button>
                        </div>
                        <div class='col-span-2' style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <Autocomplete 
                                color='primary'
                                options={allC} 
                                getOptionLabel={(option) => option.name} 
                                renderInput={(params) => <TextField sx={{input: {color: 'white'}, label:{color: 'white'}}} {...params} label="Search Class or Club" variant="outlined" />}
                                onChange={(event, value) => setSelectedC(value)}
                                style={{ width: 300 }}
                            >
                            </Autocomplete>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleNavigate}
                                disabled={!selectedC}
                            >
                                Go
                            </Button>
                        </div>
                        <div class='col-span-1 text-right mr-1'>
                            <Tooltip title="Create">
                                <IconButton 
                                    color="inherit" 
                                    variant="outlined" 
                                    aria-controls={open ? 'basic-menu' : undefined}
                                    aria-haspopup="true"
                                    aria-expanded={open ? 'true' : undefined}
                                    onClick={handleClick}
                                >
                                    <Add/>
                                </IconButton>
                                <Menu
                                    id="basic-men"
                                    anchorEl={anchorEl}
                                    open={open}
                                    onClose={handleClose}
                                    MenuListProps={{
                                      'aria-labelledby': 'basic-button',
                                    }}
                                >
                                    <MenuItem onClick={() => navigate('/create')}>Create Post</MenuItem>
                                    <MenuItem onClick={() => navigate('/createClass')}>Create Club or Class</MenuItem>
                                </Menu>
                            </Tooltip>
                            <Tooltip title="Calendar">
                                <IconButton
                                    color="inherit"
                                    onClick={() => navigate('/calendar')}>
                                        <CalendarToday/>
                                </IconButton>
                            </Tooltip>
                            <Tooltip title={"Map"}>
                                <IconButton color="inherit" variant="outlined" onClick={() => navigate('/map')}>
                                    <MapIcon/>
                                </IconButton>
                            </Tooltip>
                            <Tooltip title={user.username ? user.username : "Sign in"}>
                                <IconButton color="inherit" variant="outlined" onClick={() => handleUserClick()}>
                                    <Person/>
                                </IconButton>
                            </Tooltip>

                        </div>
                    </div>
                </Typography>
                </Toolbar>
            </AppBar>
        </Box>
    )
}

export default TopBar