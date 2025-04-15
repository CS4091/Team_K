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



const CustomAgendaEvent = ({
    event,
    selectedEvent,
    hoveredEvent,
    setHoveredEvent,
    onEdit,
    onDelete,
    theme,
    searchTerm
}) => {
    if (searchTerm && !event?.title.toLowerCase().includes(searchTerm?.toLowerCase())) {
        return null;
    }

    const formatField = (field, fallback = "Not provided") => {
        if (!field) return fallback;
        if (typeof field === "object") return JSON.stringify(field);
        return field;
    };

    return (
        <div
            id={`event-${event.id}`}
            onMouseEnter={() => setHoveredEvent(event.id)}
            onMouseLeave={() => setHoveredEvent(null)}
            style={{
                padding: '8px',
                borderRadius: '5px',
                backgroundColor:
                    hoveredEvent === event.id
                        ? theme.palette.primary.main
                        : selectedEvent && selectedEvent.id === event.id
                        ? "white"
                        : 'transparent',
                color:
                    hoveredEvent === event.id
                        ? theme.palette.primary.contrastText
                        : selectedEvent && selectedEvent.id === event.id
                        ? theme.palette.primary.main
                        : 'transparent',
                cursor: 'pointer',
                border: '1px solid #ddd',
                marginBottom: '5px'
            }}
        >
            <strong>{event.title}</strong>
            <br />
            📍 <strong>Location:</strong> {formatField(event.location, "No location specified")}
            <br />
            📝 <strong>Summary:</strong> {formatField(event.summary, "No summary provided")}
            <br />
            🏢 <strong>Hosting Group:</strong> {formatField(event.hostingGroup)}
            <br />
            👤 <strong>Event Coordinator:</strong> {formatField(event.coordinator)}
            <br />
            📧 <strong>Email:</strong> {formatField(event.email)}
            <br />
            📞 <strong>Phone:</strong> {formatField(event.phone)}
            <br />
            {event.link && (
                <>
                    🔗 <strong>Link:</strong>{" "}
                    <a href={event.link} target="_blank" rel="noopener noreferrer">
                        {event.link}
                    </a>
                    <br />
                </>
            )}
            {event.image && (
                <>
                    🖼️ <strong>Image:</strong>
                    <br />
                    <img
                        src={event.image}
                        alt="Event"
                        style={{ maxWidth: '100%', maxHeight: '150px', marginTop: '5px' }}
                    />
                    <br />
                </>
            )}
            <Button size="small" onClick={() => onEdit(event)} variant="outlined" color="black">
                Edit
            </Button>
            <Button
                size="small"
                onClick={() => onDelete(event)}
                variant="outlined"
                color="error"
                style={{ marginLeft: '10px' }}
            >
                Delete
            </Button>
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
    const [hoveredEvent, setHoveredEvent] = useState(null);
    const [hoveredSlot, setHoveredSlot] = useState(null);
    const [hoveredCalendarEvent, setHoveredCalendarEvent] = useState(null);
    const [modalData, setModalData] = useState({
        title: '', location: '', summary: '', hostingGroup: '', coordinator: '', email: '', phone: '', link: '', image: ''
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
        const response = await fetch('http://localhost:3001/event/getAll');
        const doc = await response.json();
  
        const parsedEvents = doc.map((e, index) => ({
          ...e,
          id: e._id || index,
          start: new Date(e.start),
          end: new Date(e.end),
        }));
        const realEvents = parsedEvents.filter(event => event.title)
        setEvents(realEvents);
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
            event?.title.toLowerCase().includes(searchTerm?.toLowerCase())
        );
        setFilteredEvents(filtered);
    };
    
    useEffect(() => {
        let filtered = events;
        if (searchTerm) {
            filtered = filtered.filter(event => event?.title.toLowerCase().includes(searchTerm?.toLowerCase()));
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
    

    
    const handleEditClick = (event) => {
        setSelectedEvent(event);
        setModalData({
            title: event.title,
            location: event.location,
            summary: event.summary,
            hostingGroup: event.hostingGroup || "",
            coordinator: event.coordinator || "",
            email: event.email || "",
            phone: event.phone || "",
            link: event.link || "",
            image: event.image || ''
        });
        setModalOpen(true);
    };

    
    const handleModalChange = (e) => {
        setModalData({ ...modalData, [e.target.name]: e.target.value });
    };

    const handleModalSave = async () => {
        const eventToSave = {
          ...modalData,
          start: modalData.start || new Date(),
          end: modalData.end || new Date()
        }
      
        try {
          if (selectedEvent && selectedEvent._id) {
            
            await fetch(`http://localhost:3001/event/${selectedEvent._id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(eventToSave)
            })
          } else {
            
            await fetch("http://localhost:3001/event", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(eventToSave)
            })
          }
          
          const response = await fetch('http://localhost:3001/event/getAll')
          const doc = await response.json()
          setEvents(doc.map((e, index) => ({ ...e, id: e._id || index, start: new Date(e.start), end: new Date(e.end) })))
        } catch (err) {
          console.error("Error saving event:", err)
        }
      
        setModalOpen(false)
        setSelectedEvent(null)
      }
      

      const handleDeleteEvent = async (event) => {
        const confirmDelete = window.confirm(`Are you sure you want to delete "${event.title}"?`)
        if (!confirmDelete) return
      
        try {
          await fetch(`http://localhost:3001/event/${event._id}`, { method: "DELETE" })
          setEvents(events.filter(e => e._id !== event._id))
        } catch (error) {
          console.error("Error deleting event:", error)
        }
      }
      

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
                            event: ({ event }) => (
                                <div
                                    onMouseEnter={() => setHoveredCalendarEvent(event.id)}
                                    onMouseLeave={() => setHoveredCalendarEvent(null)}
                                    style={{
                                        backgroundColor: hoveredCalendarEvent === event.id ? "white" : theme.palette.primary.main,
                                        color: hoveredCalendarEvent === event.id ? "black" : "white",
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
                                        searchTerm={searchTerm}
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
                    <Box
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: 400,
                            maxHeight: '90vh',
                            bgcolor: 'background.paper',
                            boxShadow: 24,
                            borderRadius: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            p: 0
                        }}
                    >
                        {/* Scrollable content */}
                        <Box sx={{ p: 4, overflowY: 'auto', flex: 1 }}>
                            <h2>Add a New Event</h2>

                            {["title", "location", "summary", "hostingGroup", "coordinator", "email", "phone"].map((field) => (
                                <TextField
                                    key={field}
                                    fullWidth
                                    label={field.replace(/([A-Z])/g, ' $1').trim()}
                                    name={field}
                                    value={modalData[field]}
                                    onChange={handleModalChange}
                                    margin="normal"
                                />
                            ))}

                            <TextField
                                fullWidth
                                label="Event Link"
                                name="link"
                                value={modalData.link}
                                onChange={handleModalChange}
                                margin="normal"
                            />

                            <TextField
                                fullWidth
                                label="Image URL"
                                name="image"
                                value={modalData.image}
                                onChange={handleModalChange}
                                margin="normal"
                            />
                        </Box>

                        {/* Footer buttons */}
                        <Box sx={{
                            p: 2,
                            borderTop: '1px solid #eee',
                            display: 'flex',
                            justifyContent: 'space-between'
                        }}>
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
