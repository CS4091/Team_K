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
import { Modal, Button, TextField, Box, Select, MenuItem, FormControl, InputLabel } from '@mui/material';


// Localizer Setup
const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales: { 'en-US': enUS },
});

// Custom Agenda Event Display
const CustomAgendaEvent = ({ event, selectedEvent, onEdit, onDelete, searchTerm }) => {
    if (searchTerm && !event.title.toLowerCase().includes(searchTerm.toLowerCase())) {
        return null; // Hide events that don’t match search
    }
    return (
        <div
            id={`event-${event.id}`}
            style={{
                padding: '8px',
                borderRadius: '5px',
                backgroundColor: selectedEvent && selectedEvent.id === event.id ? '#ffeb3b' : 'transparent',
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
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');  //set ups search term
    const [selectedLocation, setSelectedLocation] = useState('');
    const [selectedHostingGroup, setSelectedHostingGroup] = useState('');
    const [selectedCoordinator, setSelectedCoordinator] = useState('');
    const locations = [...new Set(events.map(event => event.location).filter(Boolean))];
    const hostingGroups = [...new Set(events.map(event => event.hostingGroup).filter(Boolean))];
    const coordinators = [...new Set(events.map(event => event.coordinator).filter(Boolean))];
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalData, setModalData] = useState({
        title: '', location: '', summary: '', hostingGroup: '', coordinator: '', email: '', phone: ''
    });

    const agendaRef = useRef(null);


    <FormControl fullWidth margin="normal">
        <InputLabel>Filter by Location</InputLabel>
        <Select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
        >
            <MenuItem value="">All</MenuItem>
            {locations.map(location => (
                <MenuItem key={location} value={location}>{location}</MenuItem>
            ))}
        </Select>
    </FormControl>

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

    const handleSearch = (e) => {
        e.preventDefault();
        const filtered = events.filter(event =>
            event.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredEvents(filtered);
    };
    
    useEffect(() => {
        let filtered = events;
        if (searchTerm) {
            filtered = filtered.filter(event => event.title.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        if (selectedLocation) {
            filtered = filtered.filter(event => event.location === selectedLocation);
        }
        if (selectedHostingGroup) {
            filtered = filtered.filter(event => event.hostingGroup === selectedHostingGroup);
        }
        if (selectedCoordinator) {
            filtered = filtered.filter(event => event.coordinator === selectedCoordinator);
        }
        setFilteredEvents(filtered);
    }, [searchTerm, selectedLocation, selectedHostingGroup, selectedCoordinator, events]);
    

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
        if (!selectedEvent) return;
        const updatedEvent = { ...selectedEvent, ...modalData };

        // Update state
        setEvents(events.map(e => (e.id === selectedEvent.id ? updatedEvent : e)));

        // Close modal
        setModalOpen(false);
    };

    // Delete an event
    const handleDeleteEvent = (event) => {
        const confirmDelete = window.confirm(`Are you sure you want to delete "${event.title}"?`);
        if (!confirmDelete) return;

        setEvents(events.filter(e => e.id !== event.id)); // Remove from state
    };

    // Add a new event
    const handleAddEvent = (slotInfo) => {
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
    };

    return (
        <ThemeProvider theme={theme}>
            <div>
                <TopBar />
                <div className="p-4">
                    <TextField 
                        label="Search Events" 
                        variant="outlined" 
                        fullWidth 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                        margin="normal"
                    /> 
                    
                    <Box display="flex" gap={2} mt={2}>
                        <FormControl fullWidth sx={{ flex: 1 }}>
                            <InputLabel>Location</InputLabel>
                            <Select
                                value={selectedLocation}
                                onChange={(e) => setSelectedLocation(e.target.value)}
                            >
                                <MenuItem value="">All</MenuItem>
                                {locations.map(location => (
                                    <MenuItem key={location} value={location}>{location}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth sx={{ flex: 1 }}>
                            <InputLabel>Hosting Group</InputLabel>
                            <Select
                                value={selectedHostingGroup}
                                onChange={(e) => setSelectedHostingGroup(e.target.value)}
                            >
                                <MenuItem value="">All</MenuItem>
                                {hostingGroups.map(group => (
                                    <MenuItem key={group} value={group}>{group}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth sx={{ flex: 1 }}>
                            <InputLabel>Coordinator</InputLabel>
                            <Select
                                value={selectedCoordinator}
                                onChange={(e) => setSelectedCoordinator(e.target.value)}
                            >
                                <MenuItem value="">All</MenuItem>
                                {coordinators.map(coord => (
                                    <MenuItem key={coord} value={coord}>{coord}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>


                    <Calendar
                        //<Button type="submit" variant="contained" color="primary">Search</Button>
                        localizer={localizer}
                        events={filteredEvents}
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
                            agenda: {
                                event: (props) => (
                                    <CustomAgendaEvent 
                                        {...props} 
                                        selectedEvent={selectedEvent} 
                                        onEdit={handleEditClick}
                                        onDelete={handleDeleteEvent}
                                        searchTerm={searchTerm}
                                    />
                                )
                            },
                        }}
                    />
                </div>

                {/* Event Edit Modal */}
                <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
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
                            <Button variant="contained" color="primary" onClick={handleModalSave}>Save</Button>
                            <Button variant="contained" color="error" onClick={() => setModalOpen(false)}>Cancel</Button>
                        </Box>
                    </Box>
                </Modal>
            </div>
        </ThemeProvider>
    );
};

export default CalendarPage;
