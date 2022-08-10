import React, { useEffect, useState } from "react";
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
  ];

  const [token, setToken] = useState('');
  const [followedArtists, setFollowedArtists] = useState('');
  const [albumData, setAlbumData] = useState({});

  useEffect(() => {
    const hash = window.location.hash;
    let token = window.localStorage.getItem('token');

    if (!token && hash) {
      token = hash.substring(1).split('&').find(elem => elem.startsWith('access_token')).split('=')[1];

      window.location.hash = '';
      window.localStorage.setItem('token', token);
    }

    setToken(token);
  }, []);

  const getFollowedArtists = async (e) => {
    e.preventDefault();

    const { data } = await axios.get('https://api.spotify.com/v1/me/following', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        type: 'artist',
        limit: 50,
      },
    });

    // setFollowedArtists(data.artists.items);
    const artistIds = data.artists.items.map((artistData) => artistData.id);

    console.log('artist ids are...', artistIds);

    // const promises = artistIds.map((artistId) => {
    //   return axios.get(`https://api.spotify.com/v1/artists/${artistId}/albums`)
    // });

    // console.log('promises are...', promises)

    const res = await Promise.all(artistIds.map(async (item) => {
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
    }));

    let albumArray = res.flat();
    console.log(albumArray);
    setAlbumData(res.flat());

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

      const yearValid = releaseYear === '2022';

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
    setAlbumData(calendarObj);
  };

  const logout = () => {
    setToken('');
    window.localStorage.removeItem('token');
  };

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];


  return (
    <div className="App">
      <header className="App-header">
        {/* <img src={logo} className="App-logo" alt="logo" />
        console */}
        {/* <p>{!data ? "Loading..." : data}</p> */}
        <h1>Timelineify</h1>

        {!token
          ? <a href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=${scopes.join('%20')}&response_type=${RESPONSE_TYPE}&show_dialog=true`}>Login to Spotify</a>
          : <button onClick={logout}>Logout</button>}
        {token
          ? <button onClick={getFollowedArtists}>Load timeline</button>
          : ''}
      </header>
      <main>
        <div className="timeline-wrapper">

          <div className="timeline-row-1">
            {Object.keys(albumData).map((month, index) => {
              if (index <= 5) {
                return (
                  <div className="month">
                    {month}
                    <ul>
                      {albumData[month].map((album) => {
                        return <li>{album.name} by {album.artists[0].name}</li>
                      })}
                    </ul>
                  </div>
                )
              }
            })}
          </div>
          <div className="timeline-row-2">

          </div>
          {/* <div className="timeline-row-3">

          </div> */}
        </div>
      </main>
    </div>
  );
}

export default App;
