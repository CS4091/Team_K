import { ThemeProvider } from '@emotion/react'
import React, {useEffect} from 'react'
import TopBar from '../Components/TopBar'
import UserModal from '../Components/UserModal'
import { useGlobalContext } from '../Context/GlobalContext'
import { useNavigate, useParams } from 'react-router-dom'

const ClubPage = () => {
    const {theme, isModalOpen, setIsModalOpen, user, searched, setSearched, clubPosts, setClubPosts, clubObject, setClubObject} = useGlobalContext()
    const {cName} = useParams()
    const navigate = useNavigate()

    const getClub = async () => {
        const response = await fetch(`http://localhost:3001/club/${cName}`)
        const className = await response.json()
        setClubObject(className)
        const postResponse = await fetch(`http://localhost:3001/post/club/${cName}`)
        const postList = await postResponse.json()
        setClubPosts(postList)
        setSearched(true)
        console.log(postList)
    }

    useEffect(() => {
           //TODO: finish this page, add search by club to the top somehow
            if (searched == false && clubPosts.length == 0) {
                getClub()
            }
            
        }, [clubPosts])

    return (
        <div>
            <ThemeProvider theme={theme}>
                <TopBar/>
                <div>
                    get posts by club
                </div>
                <UserModal isOpen={isModalOpen} setIsOpen={setIsModalOpen}/>
            </ThemeProvider>
        </div>
    )
}

export default ClubPage