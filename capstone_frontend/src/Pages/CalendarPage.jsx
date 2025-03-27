import React, { useEffect, useState, useRef } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { ThemeProvider } from '@mui/material/styles';
import { useGlobalContext } from '../Context/GlobalContext';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import "../index.css";
import 'react-big-calendar/lib/css/react-big-calendar.css';
import TopBar from '../Components/TopBar';
import { Modal, Button, TextField, Box } from '@mui/material';

// Localizer Setup
const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales: { 'en-US': enUS },
});



// Custom Agenda Event Display
const CustomAgendaEvent = ({ event, selectedEvent, hoveredEvent, setHoveredEvent, onEdit, onDelete, theme }) => {
    return (
        <div
            id={`event-${event.id}`}
            onMouseEnter={() => setHoveredEvent(event.id)}
            onMouseLeave={() => setHoveredEvent(null)}
            style={{
                padding: '8px',
                borderRadius: '5px',
                backgroundColor: hoveredEvent === event.id ? theme.palette.primary.main : selectedEvent && selectedEvent.id === event.id ? theme.palette.secondary.main : 'transparent',
                color: theme.palette.primary.contrastText,
                cursor: 'pointer',
                border: '1px solid #ddd',
                marginBottom: '5px'
            }}
        >
            <strong>{event.title}</strong>
            <br />
            📍 <strong>Location:</strong> {event.location || "No location specified"}
            <br />
            📝 <strong>Summary:</strong> {event.summary || "No summary provided"}
            <br />
            🏢 <strong>Hosting Group:</strong> {event.hostingGroup || "Not provided"}
            <br />
            👤 <strong>Event Coordinator:</strong> {event.coordinator || "Not provided"}
            <br />
            📧 <strong>Email:</strong> {event.email || "Not provided"}
            <br />
            📞 <strong>Phone:</strong> {event.phone || "Not provided"}
            <br />
            <Button size="small" onClick={() => onEdit(event)} variant="outlined" color="primary">Edit</Button>
            <Button size="small" onClick={() => onDelete(event)} variant="outlined" color="error" style={{ marginLeft: '10px' }}>Delete</Button>
        </div>
    );
};

const CalendarPage = () => {
    const { theme } = useGlobalContext();
    const [events, setEvents] = useState([]);
    const [view, setView] = useState(Views.MONTH);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [hoveredEvent, setHoveredEvent] = useState(null);
    const [hoveredSlot, setHoveredSlot] = useState(null);
    const [hoveredCalendarEvent, setHoveredCalendarEvent] = useState(null);
    const [modalData, setModalData] = useState({
        title: '', location: '', summary: '', hostingGroup: '', coordinator: '', email: '', phone: ''
    });

    const agendaRef = useRef(null);

    useEffect(() => {
        const fetchCalendarData = async () => {
            try {
                const response = await fetch('http://localhost:3001/calendar');
                const doc = await response.json();
                setEvents(doc.map((e, index) => ({ ...e, id: index }))); // Assign unique IDs
            } catch (error) {
                console.error("Calendar Error:", error);
            }
        };
        fetchCalendarData();
    }, []);

    // Auto-scroll to the selected event in Agenda View
    useEffect(() => {
        if (view === Views.AGENDA && selectedEvent) {
            setTimeout(() => {
                const eventElement = document.getElementById(`event-${selectedEvent.id}`);
                if (eventElement) {
                    eventElement.scrollIntoView({ behavior: "smooth", block: "center" });
                }
            }, 300);
        }
    }, [view, selectedEvent]);

    // Open the edit modal
    const handleEditClick = (event) => {
        setSelectedEvent(event);
        setModalData({
            title: event.title,
            location: event.location,
            summary: event.summary,
            hostingGroup: event.hostingGroup || "",
            coordinator: event.coordinator || "",
            email: event.email || "",
            phone: event.phone || ""
        });
        setModalOpen(true);
    };

    // Handle input changes in modal
    const handleModalChange = (e) => {
        setModalData({ ...modalData, [e.target.name]: e.target.value });
    };

    // Save edited event
    const handleModalSave = () => {
        if(selectedEvent) {
            const updatedEvent = { ...selectedEvent, ...modalData };
            setEvents(events.map(e => (e.id === selectedEvent.id ? updatedEvent : e)));

        } else{
            const newEvent = {
                id: events.length,
                ...modalData,
                start: modalData.start || new Date(),
                end: modalData.end || new Date(),
            };
            setEvents([...events, newEvent]);
        }
        setModalOpen(false);
        setSelectedEvent(null);
    };

    // Delete an event
    const handleDeleteEvent = (event) => {
        const confirmDelete = window.confirm(`Are you sure you want to delete "${event.title}"?`);
        if (!confirmDelete) return;

        setEvents(events.filter(e => e.id !== event.id)); // Remove from state
    };

    // Add a new event
    const handleAddEvent = (slotInfo) => {
        
        setModalData({
            title: '',
            location: '',
            summary: '',
            hostingGroup: '',
            coordinator: '',
            email: '',
            phone: '',
            start: slotInfo.start,
            end: slotInfo.end,
        });
        setSelectedEvent(null);
        setModalOpen(true);

        /*
        const title = prompt("Enter Event Title:");
        if (!title) return;

        const location = prompt("Enter Event Location (Optional):");
        const summary = prompt("Enter Event Summary (Optional):");
        const hostingGroup = prompt("Enter Hosting Group (Optional):");
        const coordinator = prompt("Enter Event Coordinator (Optional):");
        const email = prompt("Enter Contact Email (Optional):");
        const phone = prompt("Enter Contact Phone (Optional):");

        const newEvent = {
            id: events.length, // Assign unique ID
            title,
            location: location || "No location specified",
            summary: summary || "No summary provided",
            hostingGroup: hostingGroup || "Not provided",
            coordinator: coordinator || "Not provided",
            email: email || "Not provided",
            phone: phone || "Not provided",
            start: slotInfo.start,
            end: slotInfo.end,
        };

        setEvents([...events, newEvent]); // Update state

        */
    };

    //hover over event
    const handleMouseEnter = (event) => {
        setHoveredEvent(event.id);
    };

    //cursor leaves event
    const handleMouseLeave = () => {
        setHoveredEvent(null);
    };

    //hover over cell
    const handleSlotMouseEnter = (slotId) => {
        setHoveredSlot(slotId);
    }

    //cursor leaves cell
    const handleSlotMouseLeave = () => {
        setHoveredSlot(null);
    }


    return (
        <ThemeProvider theme={theme}>
            <div>
                <TopBar />
                <div className="p-4">
                    <Calendar
                        localizer={localizer}
                        events={events}
                        startAccessor="start"
                        endAccessor="end"
                        view={view}
                        date={view === Views.AGENDA ? new Date() : undefined}
                        length={31}
                        onView={setView}
                        selectable
                        onSelectSlot={handleAddEvent} // Enable adding new events
                        onSelectEvent={(event) => {
                            setSelectedEvent(event);
                            setView(Views.AGENDA);
                        }}
                        style={{ height: 500 }}
                        components={{
                            event: ({ event }) => (
                                <div
                                    onMouseEnter={() => setHoveredCalendarEvent(event.id)}
                                    onMouseLeave={() => setHoveredCalendarEvent(null)}
                                    style={{
                                        backgroundColor: hoveredCalendarEvent === event.id ? "white" : theme.palette.primary.main,
                                        color: hoveredCalendarEvent === event.id ? "black" : theme.palette.primary.main,
                                        padding: "5px",
                                        borderRadius: "4px",
                                        cursor: "pointer",
                                        border: hoveredCalendarEvent === event.id ? "1px solid #ccc" : "none",
                                        transition: "all 0.2s ease-in-out",
                                    }}
                                >
                                    {event.title}
                                </div>
                            ),
                            agenda: {
                                event: (props) => (
                                    <CustomAgendaEvent 
                                        {...props} 
                                        selectedEvent={selectedEvent}
                                        hoveredEvent={hoveredEvent}
                                        setHoveredEvent={setHoveredEvent}
                                        onEdit={handleEditClick}
                                        onDelete={handleDeleteEvent}
                                        theme={theme}
                                    />
                                )
                            },
                            /* timeSlotWrapper: (props) => {
                                const { children, value } = props;
                                return (
                                    <div
                                        className="custom-time-slot"
                                        onMouseEnter={() => handleSlotMouseEnter(value)}
                                        onMouseLeave={handleSlotMouseLeave}
                                        
                                        style={{
                                            backgroundColor: hoveredSlot === value ? "rgba(0, 122, 51, 0.3)" : "transparent",
                                            transition: "background-color 0.2s ease-in-out",
                                            width: "100%",
                                            height: "100%",
                                        }}
                                        
                                    >
                                        {children}
                                    </div>
                                );
                            } */
                        }}
                    />
                </div>

                {/* Event Edit Modal */}
                <Modal open={modalOpen} onClose={() => setModalOpen(false)} BackdropProps={{
                    style: {
                        backgroundColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }}>
                    <Box sx={{
                        position: 'absolute', top: '50%', left: '50%',
                        transform: 'translate(-50%, -50%)', width: 400,
                        bgcolor: 'background.paper', boxShadow: 24, p: 4, borderRadius: 2
                    }}>
                        <h2>Edit Event</h2>
                        {["title", "location", "summary", "hostingGroup", "coordinator", "email", "phone"].map((field) => (
                            <TextField
                                key={field}
                                fullWidth label={field.replace(/([A-Z])/g, ' $1').trim()}
                                name={field} value={modalData[field]}
                                onChange={handleModalChange}
                                margin="normal"
                            />
                        ))}
                        <Box mt={2} display="flex" justifyContent="space-between">
                            <Button
                                variant="outlined"
                                onClick={() => setModalOpen(false)}
                                sx={{
                                    backgroundColor: 'white',
                                    color: theme.palette.primary.main,
                                    borderColor: theme.palette.primary.main,
                                    '&:hover': {
                                        backgroundColor: '#f5f5f5',
                                    },
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleModalSave}
                            >
                                Save
                            </Button>
                        </Box>
                    </Box>
                </Modal>
            </div>
        </ThemeProvider>
    );
};

export default CalendarPage;
