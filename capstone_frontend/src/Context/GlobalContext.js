import React, { createContext, useState, useContext, useEffect } from 'react';
import {  createTheme} from '@mui/material/styles'
import { useCookies } from 'react-cookie';

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
    const [searched, setSearched] = useState(false)
    const [isSnackOpen, setIsSnackOpen] = useState(false)
    const [snackMessage, setSnackMessage] = useState("")
    const [cPosts, setCPosts] = useState([])
    const [cObject, setCObject] = useState({})
    const [allC, setAllC] = useState([])
    const [cookies, setCookie, removeCookie] = useCookies(['user'])

    const getAllClasses = async () => {
      const response = await fetch("http://localhost:3001/both/getAll");
      const both = await response.json()
      setAllClasses(both.classes)
      setAllClubs(both.clubs)
      setAllC([...both.classes, ...both.clubs])
  }

  const checkUser = () => {
    if (cookies.user) {
      setUser(cookies.user)
    }
  }

  useEffect(() => {
      getAllClasses()
      checkUser()
  }, [])

    return React.createElement(
        GlobalContext.Provider,
        { value: {theme, setTheme, user, setUser, isModalOpen, setIsModalOpen, allClasses, setAllClasses, searched, setSearched, isSnackOpen, setIsSnackOpen, snackMessage, setSnackMessage, allClubs, setAllClubs, cPosts, setCPosts, cObject, setCObject, allC, cookies, setCookie, removeCookie } },
        children
      );
    
}

export function useGlobalContext() {
    return useContext(GlobalContext);
  }
  