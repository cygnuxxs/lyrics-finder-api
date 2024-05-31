const express = require('express');
const app = express();
const port = process.env.PORT || 1155;
const Genius = require('genius-lyrics');
const Client = new Genius.Client();

app.use(express.json());

app.get('/', (req, res) => {
    res.send({'message' : 'Hello'})
})
app.get('/search', async (req, res) => {
    const { query } = req.query;
    if (!query) {
        return res.status(400).send('Query parameter is required.');
    }
    try {
        const response = await Client.songs.search(query);
        const songs = response.map(song => ({
            songId: song.id,
            title: song.title,
            fullTitle: song.fullTitle,
            image: song.image,
            artistName: song.artist?.name,
            albumName: song.album?.name,
            url : song.url,
            releaseDate: song._raw?.release_date_with_abbreviated_month_for_display
        }));
        res.json(songs);
    } catch (error) {
        console.error('Error fetching song details:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/lyrics', async (req, res) => {
    const {url} = req.body
    if (url) {
        const ScrapedSong = await Client.songs.scrape(url)
        const lyrics = await ScrapedSong.lyrics(true)
        res.json(lyrics)
    } else res.status(400).send({message : 'URL not provided'})
})

module.exports = app
