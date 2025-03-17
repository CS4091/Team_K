import React, { useEffect, useState } from 'react'
import { Calendar, dateFnsLocalizer} from 'react-big-calendar';
import { ThemeProvider } from '@mui/material/styles';
import { useGlobalContext } from '../Context/GlobalContext';
import format from 'date-fns/format'
import parse from 'date-fns/parse'
import startOfWeek from 'date-fns/startOfWeek'
import getDay from 'date-fns/getDay'
import enUS from 'date-fns/locale/en-US'
import "../index.css"
import 'react-big-calendar/lib/css/react-big-calendar.css';



import TopBar from '../Components/TopBar'
/*
import { ThemeProvider } from '@emotion/react';
import { useGlobalContext } from '../Context/GlobalContext';
import Upvote from '../Components/Upvote';
import OutlinedTextarea from '../Components/TextArea';
import { useNavigate, useParams } from 'react-router-dom';
import UserModal from '../Components/UserModal'
*/

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales: { 'en-US': enUS },
});

const GetCalendar = ({ events }) => (
    <div>
        <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 500 }}
        />
    </div>
)

const CalendarPage = () => {
    const { theme } = useGlobalContext();
    const [events, setEvents] = useState([]);
    useEffect(() => {
        const fetchCalendarData = async () => {
            try {
                const response = await fetch('http://localhost:3001/calendar')
                const doc = await response.json()
                setEvents(doc);
            } catch (error) {
                console.error("Calendar Error:", error);
            }
        };
        fetchCalendarData();
    }, []);

    useEffect(() => {
        console.log({events})
    }, [events])
    return (
        <ThemeProvider theme={theme}>
            <div>
                <TopBar/>
                <div className="p-4">
                    <GetCalendar events={events}/>
                </div>
            </div>
        </ThemeProvider>
    );
};

export default CalendarPage;





