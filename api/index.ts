import express, { Request, Response } from 'express';
import cors from 'cors'
import Genius from 'genius-lyrics';

const app = express();
const port = process.env.PORT || 1155;
const Client = new Genius.Client();

app.use(express.json());
app.use(cors());

app.get('/', (req:Request, res : Response) => {
    res.send({'Message' : 'Hello'})
})

app.get('/search', async (req: Request, res: Response) => {
    const query: string | undefined = req.query.query as string;
    if (!query) {
        return res.status(400).send('Query parameter is required.');
    }
    try {
        const response = await Client.songs.search(query);
        const songs = response.map((song: any) => ({
            songId: song.id,
            title: song.title,
            fullTitle: song.fullTitle,
            image: song.image,
            artistName: song.artist?.name,
            albumName: song.album?.name,
            url: song.url,
            releaseDate: song._raw?.release_date_with_abbreviated_month_for_display
        }));
        res.json(songs);
    } catch (error) {
        console.error('Error fetching song details:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/lyrics', async (req: Request, res: Response) => {
    const { url } = req.body;
    if (url) {
        try {
            const ScrapedSong = await Client.songs.scrape(url);
            const lyrics = await ScrapedSong.lyrics(true);
            res.json(lyrics);
        } catch (error) {
            console.error('Error fetching lyrics:', error);
            res.status(500).send('Internal Server Error');
        }
    } else {
        res.status(400).send({ message: 'URL not provided' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
