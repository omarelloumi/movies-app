import {useEffect, useState} from "react";
import Search from "./components/Search.tsx";
import Spinner from "./components/Spinner.tsx";
import MovieCard from "./components/MovieCard.tsx";
import {useDebounce} from "react-use";
import type {Movie} from "./types/Movie.ts";
import {getTrendingMovies, updateSearchCount} from "./lib/appwrite.ts";
import type {Models} from 'appwrite';


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        Authorization: `Bearer ${API_KEY}`
    }
}


function App() {

    const [searchTerm, setSearchTerm] = useState('');
    const [movieList, setMovieList] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
    const [trendingMovies, setTrendingMovies] = useState<Models.Document[]>([]);

    useDebounce((): void =>
        setDebouncedSearchTerm(searchTerm),800,[searchTerm]
    )

    const fetchMovies = async (query: string = '') => {
        setIsLoading(true)
        setErrorMessage('');
        try {
            const endpoint = query
                ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
                : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

            const response = await fetch(endpoint, API_OPTIONS);

            if(!response.ok) {
                throw new Error('Failed to fetch movies');
            }

            const data = await response.json();

            if(data.Response === 'False') {
                setErrorMessage(data.Error || 'Failed to fetch movies');
                setMovieList([]);
                return;
            }

            if(query && data.results.length > 0) {
                await updateSearchCount(query, data.results[0]);
            }

            return data;
        }catch (error) {
            console.error(`Error fetching movies: ${error}`);
            setErrorMessage('Error fetching movies. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    }

    const loadTrendingMovies = async () => {
        try {
            return await getTrendingMovies();
        } catch (error) {
            console.error(`Error fetching trending movies: ${error}`);
        }
    }

    useEffect(() => {
        fetchMovies(debouncedSearchTerm).then((data) => {
            if (data && Array.isArray(data.results)) {
                setMovieList(data.results);
                console.log(data.results);
            } else {
                setMovieList([]); // fallback
            }
        });
    }, [debouncedSearchTerm]);

    useEffect(() => {
        loadTrendingMovies().then((data =>{
            if (data && Array.isArray(data)) {
                setTrendingMovies(data);
                console.log(data);
            } else {
                setMovieList([]); // fallback
            }
        }))
    }, []);
  return (
      <main>
          <div className="pattern"/>
          <div className="wrapper">
              <header>
                  <img src="./hero.png" alt="Hero Banner" />
                  <h1>Find <span className="text-gradient">Movies</span> You'll Enjoy Without the Hassle</h1>
                  <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm}/>
              </header>

              {trendingMovies.length > 0 && (
                  <section className="trending">
                      <h2>Trending Movies</h2>

                      <ul>
                          {trendingMovies.map((movie, index) => (
                              <li key={movie.$id}>
                                  <p>{index + 1}</p>
                                  <img src={movie.poster_url} alt={movie.title} />
                              </li>
                          ))}
                      </ul>
                  </section>
              )}

              <section className="all-movies">
                  <h2>{searchTerm ? 'Here are the movies depending on your search' : 'All movies'}</h2>
                  {isLoading ? (
                      <Spinner/>
                  ) : errorMessage ? (
                      <p className="text-red-500">{errorMessage}</p>
                  ) : movieList && (
                          <ul>
                            {movieList.map((movie:Movie) => (
                                <MovieCard key={movie.id} movie={movie} />
                            ))}
                          </ul>
                  )}
              </section>
          </div>
      </main>
  )
}

export default App