import styled from "styled-components";
import axios from "axios";
import Autosuggest from "react-autosuggest";
import { useMemo, useEffect, useState } from "react";
import { ToastContainer, Flip } from "react-toastify";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import './Autosuggest.css';
import useUrlState from '@ahooksjs/use-url-state';
import { Routes, Route } from "react-router";
import { BrowserRouter } from "react-router-dom";
import { Button } from "./GlobalStyles";
import { Share } from "./components/Share";
import { NAME } from "./constants";
import RefreshIcon from '@mui/icons-material/Refresh';

const Container = styled.div`
  display: flex;
  text-align: center;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

const Title = styled.div`
  display: flex;
  font-size: 3rem;
`;


const InputContainer = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  gap: 0.5rem;
`;

const GuessContainer = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
`;

const RefreshButton = styled.div`
  cursor: pointer;
`;

const renderSuggestion = suggestion => (
  <div>
    {suggestion}
  </div>
);


const getRandomArticle = () => {
    return axios.get("https://en.wikipedia.org/w/api.php?action=query&origin=*&list=random&format=json&rnnamespace=0&rnlimit=1")
  } 

const popularArticlesUrl = (offset) => `https://en.wikipedia.org/w/api.php?action=query&origin=*&list=mostviewed&pvimoffset=${offset}&format=json&pvimlimit=500`

const getLinksUrl = (title, continueString='') => (
  `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=links&meta=&titles=${title}&pllimit=max${continueString !== '' ? `&plcontinue=${continueString}` : ''}`
)
const filterResponse = (articles) => articles.filter(article => article.ns === 0)
                                                          .map(article => article.title)

const randomIndex = (list) => {
  const randomIndex = Math.floor(Math.random() * list.length)
  return randomIndex;
}

const parseLinks = (response) => {
  const pages = response.data.query.pages;
  let links = [];
  for (const pageCode in pages) {
    const page = pages[pageCode];
    const filteredLinks = page.links ? filterResponse(page.links) : [];
    links = [...links, ...filteredLinks];
  }
  return links;
}

const getAllLinks = async (title) => {
  let contin = true;
  let allLinks = [];
  let continueString = '';
  while (contin) {
    await axios.get(getLinksUrl(title, continueString))
      .then(
        (response) => {
          const links = parseLinks(response);
          allLinks = [...allLinks, ...links];
          if (response.data.continue) {
            continueString = response.data.continue.plcontinue;
          } else {
            contin = false;
          }
        })
      .catch(
        (res) => console.log(res)
      );
  }
  return allLinks;
}


function App() {
  const [endpoints, setEndpoints] = useUrlState({start: '',
                                                end: ''});
  const [input, setInput] = useState('');
  const [guess, setGuess] = useState('');
  const [guesses, setGuesses] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [links, setLinks] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (endpoints.start === '') return;
    setGuess(endpoints.start);
    setGuesses(guesses => [endpoints.start]);
  },[endpoints]);

  useEffect(() => {
    const jumpThroughLinks = async (start, timesToJump) => {
      let current = start;
      for (let i = 0; i < timesToJump; i++) {
        await axios.get(getLinksUrl(current))
        .then((response) => {
          const links = parseLinks(response);
          const randIndex = randomIndex(links);
          current = links[randIndex];
        })
      }
      return current;
    };

    if (endpoints.start === '' && endpoints.end === '') {
      newEndpoints();
    }
  }, []);

  useEffect(() => {
    if (!guess) return;
    if (guess.toLowerCase() === endpoints.end.toLowerCase()) {
      setGameOver(true);
      console.log("YOU WON");
      toast(`🎉 Congrats! Score: ${score} 🎉`);
      return;
    }

    getAllLinks(guess)
    .then(links => setLinks(links))
    .catch((res) => console.log(res));

  }, [guess]);

  const getSuggestions = value => {
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;

    return inputLength === 0 ? [] : links.filter(link =>
      link.toLowerCase().slice(0, inputLength) === inputValue
    );
  };

  const newEndpoints = () => {
    getAllLinks('Wikipedia:Vital articles')
      .then((popularArticles) => {
        const randIndex = randomIndex(popularArticles);
        const startArticle = popularArticles[randIndex];
        console.log(startArticle);
        // setGuess(startArticle);
        // setGuesses(guesses => [...guesses, startArticle]);
        setEndpoints(endpoints => ({
          start: startArticle,
          end: popularArticles[randomIndex(popularArticles)]
        }));
      });
  }

  const handleGuess = () => {
    if (links.indexOf(input) !== -1) {
      setGuess(input);
      setGuesses(guesses => [...guesses, input]);
      setInput('');
      setScore(score => score + 1);
    }
  }

  const handleEnter = e => {
    if (e.keyCode === 13) {
      handleGuess();
    }
  };

  const handleBack = e => {
    if (guesses.length < 2) return;
    const lastGuess = guesses[guesses.length - 2]
    setGuesses(guesses => guesses.filter(prev => prev !== guess))
    setGuess(lastGuess);
    setScore(score => score + 1);
  }

  const handleReload = () => {
    newEndpoints();
    setGameOver(false);
    setScore(0);
  }

  const inputProps = {
    placeholder: 'Guess a linked article',
    value: input,
    onChange: (event, { newValue }) => setInput(newValue),
    onKeyDown: handleEnter,
    disabled: gameOver
  };

  return (
    <Container>
      <ToastContainer
        hideProgressBar
        position="top-center"
        transition={Flip}
        autoClose={false}
      />
      <Title>{`[${NAME}]`}</Title>
      <RefreshButton onClick={handleReload}><RefreshIcon /></RefreshButton>
      <div>{`${endpoints.start} \u2192 ${endpoints.end}`}</div>
      {gameOver && <Share 
        start={endpoints.start}
        end={endpoints.end}
        score={score}
      />}
      <InputContainer>
      <Autosuggest
        suggestions={suggestions}
        onSuggestionsFetchRequested={({value}) => setSuggestions(getSuggestions(value))}
        onSuggestionsClearRequested={() => setSuggestions([])}
        getSuggestionValue={suggestion => suggestion}
        renderSuggestion={renderSuggestion}
        inputProps={inputProps}
      />
      <Button onClick={handleGuess}>Select</Button>
      <Button onClick={handleBack}>Back up</Button>
      </InputContainer>
      <GuessContainer>
      {guesses?.map((guess, index) => (
        <>
        <div key={index}>{guess}</div>
        {index !== guesses.length - 1 && <div key={`arrow${index}`}>{'\u2193'}</div>}
        </>
      ))}
      </GuessContainer>
    </Container>
  );

}

export default () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
      </Routes>
    </BrowserRouter>
  );
};
