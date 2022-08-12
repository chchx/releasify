import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const CLIENT_ID = '7e4d786cede748ce82a2e62f54b0ed5b';
  const REDIRECT_URI = 'http://localhost:3000';
  const AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize';
  const RESPONSE_TYPE = 'token';

  const scopes = [
    'user-top-read',
    'user-follow-read',
    'user-library-read',
    'user-read-email',
  ];

  const [token, setToken] = useState('');
  const [albumData, setAlbumData] = useState([]);
  const [albumCalendar, setAlbumCalendar] = useState({});
  const [year, setYear] = useState(2022);

  useEffect(() => {
    const { hash } = window.location;
    let browserToken = window.localStorage.getItem('token');

    if (!browserToken && hash) {
      browserToken = hash.substring(1).split('&').find(elem => elem.startsWith('access_token')).split('=')[1];

      window.location.hash = '';
      window.localStorage.setItem('token', browserToken);
    }

    setToken(browserToken);

    // axios.get('https://api.spotify.com/v1/me', {
    //   headers: {
    //     Authorization: `Bearer ${token}`,
    //   },
    // })
    //   .then((response) => {
    //     console.log('email is...', response.data.email);
    //     axios.get('/users', {
    //       params: { email: response.data.email },
    //     });
    //   });
  }, []);

  useEffect(() => {
    if (Object.keys(albumData).length > 0) {
      setAlbumCalendar(createCalendar(albumData, year));
    }
  }, [year]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const getArtists = (cursor, data = []) => axios.get('https://api.spotify.com/v1/me/following', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: {
      type: 'artist',
      limit: 50,
      after: cursor || null,
    },
  }) // API supports a cursor param (?after=)
    .then((response) => {
      console.log('first response is...', response);
      console.log('CURSOR IS...', response.data.artists.cursors.after);
      data.push(...response.data.artists.items);
      if (response.data.artists.cursors.after === null) return data;
      return getArtists(response.data.artists.cursors.after, data);
    });

  const getFollowedArtists = async (e) => {
    e.preventDefault();

    getArtists()
      .then((result) => {
        console.log('final data is...', result);
        // setArtistIds(result.map((artistData) => artistData.id));
        return result.map((artistData) => artistData.id);
      })
      .then((mappedIds) => Promise.all(mappedIds.map(async (item) => {
        let response;
        try {
          response = await axios.get(`https://api.spotify.com/v1/artists/${item}/albums`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            params: {
              include_groups: 'album',
            },
          });
        } catch (err) {
          return err;
        }
        return response.data.items;
      })))
      .then((albums) => {
        const albumArray = albums.flat();
        setAlbumData(albumData.concat(albumArray));
        setAlbumCalendar(createCalendar(albumArray, year));
      });
  };

  const createCalendar = (albumArray, year) => {
    const calendarObj = {
      January: [],
      February: [],
      March: [],
      April: [],
      May: [],
      June: [],
      July: [],
      August: [],
      September: [],
      October: [],
      November: [],
      December: [],
    };

    albumArray.forEach((album) => {
      const releaseMonth = album.release_date.split('-')[1];
      const releaseYear = album.release_date.split('-')[0];

      const yearValid = releaseYear === String(year);

      if (releaseMonth === '01' && yearValid) calendarObj.January.push(album);
      if (releaseMonth === '02' && yearValid) calendarObj.February.push(album);
      if (releaseMonth === '03' && yearValid) calendarObj.March.push(album);
      if (releaseMonth === '04' && yearValid) calendarObj.April.push(album);
      if (releaseMonth === '05' && yearValid) calendarObj.May.push(album);
      if (releaseMonth === '06' && yearValid) calendarObj.June.push(album);
      if (releaseMonth === '07' && yearValid) calendarObj.July.push(album);
      if (releaseMonth === '08' && yearValid) calendarObj.August.push(album);
      if (releaseMonth === '09' && yearValid) calendarObj.September.push(album);
      if (releaseMonth === '10' && yearValid) calendarObj.October.push(album);
      if (releaseMonth === '11' && yearValid) calendarObj.November.push(album);
      if (releaseMonth === '12' && yearValid) calendarObj.December.push(album);
    });

    console.log(calendarObj)

    Object.keys(calendarObj).forEach((month) => {
      calendarObj[month] = calendarObj[month].filter((month, i, array) => array.findIndex(t => t.name === month.name) === i);
    });
    return calendarObj;
  };

  const logout = () => {
    setToken('');
    window.localStorage.removeItem('token');
  };

  const arrowHandler = (e) => {
    console.log(e.target.id)
    if (e.target.id === 'left-arrow') {
      setYear(year - 1);
      // setAlbumCalendar(createCalendar(albumData, year));
    }
    if (e.target.id === 'right-arrow') {
      setYear(year + 1);
    }
    // setAlbumCalendar(createCalendar(albumData, year));
  };

  const keyHandler = (e) => {
    console.log('User pressed: ', e.key)
    if (e.key === 'ArrowLeft') {
      setYear(year - 1);
      // setAlbumCalendar(createCalendar(albumData, year));
    }
    if (e.key === 'ArrowRight') {
      if (year < 2022) {
        setYear(year + 1);
      }
    }
  };

  return (
    <div className="App" tabIndex={0} onKeyDown={keyHandler}>
      <header className="App-header">
        <h1>Timelineify</h1>
        {token && Object.keys(albumCalendar).length === 0
          ? <button onClick={getFollowedArtists}>Load timeline</button>
          : ''}
      </header>
      <main>
        {Object.keys(albumCalendar).length > 1
          && <h2>{year}</h2>}
        {albumData.length > 0 &&
          <svg xmlns="http://www.w3.org/2000/svg" onClick={arrowHandler} className="left-arrow" width="7vw" height="7vh" fill="white" viewBox="7 5 6 9.99">
            <path id="left-arrow" fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" fillOpacity="75%"></path>
          </svg>
        }
        <div className="timeline-wrapper">
          <div className="row-container">
            <div className="timeline-row">
              {Object.keys(albumCalendar).map((month, index) => {
                if (index <= 5) {
                  return (
                    <div className="month-container">
                      <div className="month-title">{month}</div>
                      <ol>
                        {albumCalendar[month].map((album, array) => {
                          return <li><a href={album.external_urls.spotify}>{album.name}</a> by {album.artists[0].name}</li>
                        })}
                      </ol>
                    </div>
                  );
                }
              })}
            </div>
            <div className="timeline-row">
              {Object.keys(albumCalendar).map((month, index) => {
                if (index > 5) {
                  return (
                    <div className="month-container">
                      <div className="month-title">{month}</div>
                      <ol>
                        {albumCalendar[month].map((album, array) => {
                          return <li><a href={album.external_urls.spotify}>{album.name}</a> by {album.artists[0].name}</li>
                        })}
                      </ol>
                    </div>
                  );
                }
              })}
            </div>

          </div>
        </div>
        {year < 2022
          && <svg xmlns="http://www.w3.org/2000/svg" onClick={arrowHandler} className="right-arrow" fill="white" width="7vw" height="7vh" viewBox="7 5.01 6 9.99">
            <path id="right-arrow" fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" fillOpacity="75%"></path>
          </svg>
        }
      </main>
      <div className="logout-container">
        {!token
          ? <a href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=${scopes.join('%20')}&response_type=${RESPONSE_TYPE}&show_dialog=true`}>Login to Spotify</a>
          : <button onClick={logout}>Logout</button>}
      </div>
      <footer>
        <p>Made with ❤️ by <a href="https://github.com/chrisxchoi">@chrisxchoi</a></p>
      </footer>
    </div>
  );
}

export default App;
