import React, { createContext, useState, useContext, useEffect } from 'react';
import {  createTheme} from '@mui/material/styles'

const GlobalContext = createContext();

export const GlobalProvider = ({children}) => {
    const [theme, setTheme] = useState(createTheme({
        palette: {
          primary: {
            main: '#154734',
            contrastText: '#FFFFFF',
          },
          secondary: {
            main: '#007A33',
            contrastText: '#FFFFFF',
          },
          background: {
            paper: '#FFFFFF', // Light background for inputs and cards
            default: '#F5F5F5',
          },
          text: {
            primary: '#000000', // Black text on light backgrounds
            secondary: '#666666',
          },
        },
      }))
    const [user, setUser] = useState({})
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [allClasses, setAllClasses] = useState([])
    const [allClubs, setAllClubs] = useState([])
    const [classPosts, setClassPosts] = useState([])
    const [clubPosts, setClubPosts] = useState([])
    const [searched, setSearched] = useState(false)
    const [classObject, setClassObject] = useState({})
    const [clubObject, setClubObject] = useState({})
    const [isSnackOpen, setIsSnackOpen] = useState(false)
    const [snackMessage, setSnackMessage] = useState("")

    const getAllClasses = async () => {
      const response = await fetch("http://localhost:3001/both/getAll");
      const both = await response.json()
      setAllClasses(both.classes)
      setAllClubs(both.clubs)
  }

  useEffect(() => {
      getAllClasses()
  }, [])

    return React.createElement(
        GlobalContext.Provider,
        { value: {theme, setTheme, user, setUser, isModalOpen, setIsModalOpen, allClasses, setAllClasses, classPosts, setClassPosts, searched, setSearched, classObject, setClassObject, isSnackOpen, setIsSnackOpen, snackMessage, setSnackMessage, allClubs, setAllClubs, clubPosts, setClubPosts, clubObject, setClubObject } },
        children
      );
    
}

export function useGlobalContext() {
    return useContext(GlobalContext);
  }
  