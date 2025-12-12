import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Typography,
  Button,
  Card,
  CardMedia,
  CardContent,
  Box,
  TextField,
  InputAdornment,
  Paper
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PetsIcon from '@mui/icons-material/Pets';
import { Link } from 'react-router-dom';
import axios from 'axios';
import MapView from '../components/MapView';

function HomePage() {
  const [recentPets, setRecentPets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    fetchRecentPets();
  }, []);

  const fetchRecentPets = async () => {
    try {
      const response = await axios.get('/api/pets?status=missing&limit=6');
      setRecentPets(response.data);
    } catch (error) {
      console.error('Error fetching pets:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Redirect to search page with parameters
    window.location.href = `/search?q=${searchTerm}&location=${location}`;
  };

  return (
    <>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 8,
          mb: 6
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" gutterBottom>
                Find Missing Pets in Your Area
              </Typography>
              <Typography variant="h5" paragraph>
                Connect lost pets with their loving families through our community-powered platform.
              </Typography>
              <Box sx={{ mt: 4 }}>
                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  component={Link}
                  to="/report"
                  sx={{ mr: 2 }}
                >
                  Report Missing Pet
                </Button>
                <Button
                  variant="outlined"
                  color="inherit"
                  size="large"
                  component={Link}
                  to="/search"
                >
                  Search Pets
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.9)' }}>
                <form onSubmit={handleSearch}>
                  <Typography variant="h6" color="text.primary" gutterBottom>
                    Search for missing pets
                  </Typography>
                  <TextField
                    fullWidth
                    label="Pet type, breed, or name"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    margin="normal"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PetsIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    fullWidth
                    label="City or ZIP code"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    margin="normal"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationOnIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    size="large"
                    startIcon={<SearchIcon />}
                    sx={{ mt: 2 }}
                  >
                    Search Now
                  </Button>
                </form>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="lg">
        {/* Recent Missing Pets */}
        <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
          Recently Reported Missing Pets
        </Typography>
        
        <Grid container spacing={3}>
          {recentPets.map((pet) => (
            <Grid item xs={12} sm={6} md={4} key={pet._id}>
              <Card component={Link} to={`/pet/${pet._id}`} sx={{ textDecoration: 'none' }}>
                {pet.images && pet.images.length > 0 && (
                  <CardMedia
                    component="img"
                    height="200"
                    image={pet.images[0].url}
                    alt={pet.name}
                  />
                )}
                <CardContent>
                  <Typography variant="h6">{pet.name}</Typography>
                  <Typography color="textSecondary">
                    {pet.species} • {pet.breed}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Last seen: {new Date(pet.lastSeen).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2" color="error">
                    {pet.location?.city}, {pet.location?.state}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Map Section */}
        <Box sx={{ mt: 8 }}>
          <Typography variant="h4" gutterBottom>
            Missing Pets Near You
          </Typography>
          <Paper sx={{ height: 400, mt: 2 }}>
            <MapView pets={recentPets} />
          </Paper>
        </Box>

        {/* Stats Section */}
        <Box sx={{ mt: 8, textAlign: 'center' }}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Typography variant="h3" color="primary">
                1,000+
              </Typography>
              <Typography variant="h6">
                Pets Reunited
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h3" color="primary">
                5,000+
              </Typography>
              <Typography variant="h6">
                Active Volunteers
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h3" color="primary">
                100+
              </Typography>
              <Typography variant="h6">
                Cities Covered
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </>
  );
}

export default HomePage;