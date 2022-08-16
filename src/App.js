import styled from "styled-components";
import axios from "axios";
import Autosuggest from "react-autosuggest";
import { useMemo, useEffect, useState } from "react";
import './Autosuggest.css';

const Container = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

const Title = styled.div`
  display: flex;
  font-size: 3rem;
`;

const Button = styled.button`
  padding:10px;
  border-radius: 10px;
  border-width: 0px;
  font-family: "Boston-Regular";
  background-color: lightgrey;
  :active {
    background-color: darkgrey;
  }
  @media (prefers-color-scheme: dark) {
    background-color: #1F2023;
    color: #DADADA
  }
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



const renderSuggestion = suggestion => (
  <div>
    {suggestion}
  </div>
);

// TODO:
// - End point should not be totally random, jump random number of times from start
// - Restrict categories - too hard now
// - Back button to return to previous article
// - Make sure all links are fetched - not just 500
// - Logo and style (dark mode etc)
// - Show and share score at the end
// - Host on netlify
const getRandomArticle = () => {
    return axios.get("https://en.wikipedia.org/w/api.php?action=query&origin=*&list=random&format=json&rnnamespace=0&rnlimit=1")
  } 

const popularArticlesUrl = (offset) => `https://en.wikipedia.org/w/api.php?action=query&origin=*&list=mostviewed&pvimoffset=${offset}&format=json&pvimlimit=500`

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



function App() {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [input, setInput] = useState('');
  const [guess, setGuess] = useState('');
  const [guesses, setGuesses] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [links, setLinks] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const jumpThroughLinks = async (start, timesToJump) => {
      let current = start;
      for (let i = 0; i < timesToJump; i++) {
        console.log(start);
        await axios.get(`https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=links&meta=&titles=${current}&pllimit=max`)
        .then((response) => {
          const links = parseLinks(response);
          const randIndex = randomIndex(links);
          current = links[randIndex];
        })
      }
      return current;
    };
    axios.get(popularArticlesUrl(0))
    .then((res) => {
      console.log(res)
      const popularArticles = filterResponse(res.data.query.mostviewed);
      const randIndex = randomIndex(popularArticles);
      const start = popularArticles[randIndex]
      setGuess(start);
      setStart(start);
      const timesToJump = Math.floor(Math.random() * 3) + 2;
      jumpThroughLinks(start, timesToJump).then(end => setEnd(end));
    })
  }, []);

  useEffect(() => {
    if (!guess) return;
    if (guess.toLowerCase() === end.toLowerCase()) {
      setGuesses(guesses => [...guesses, guess]);
      setGameOver(true);
      console.log("YOU WON");
      return;
    }

    const getAllLinks = async () => {
      let contin = true;
      let allLinks = [];
      let continueString = '';
      while (contin) {
        console.log("loopin")
        await axios.get(`https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=links&meta=&titles=${guess}&pllimit=max${continueString !== '' ? `&plcontinue=${continueString}` : ''}`)
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
      setLinks(allLinks);
      setGuesses(guesses => [...guesses, guess]);
    }
    getAllLinks().catch((res) => console.log(res));

  }, [guess]);

  const getSuggestions = value => {
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;

    return inputLength === 0 ? [] : links.filter(link =>
      link.toLowerCase().slice(0, inputLength) === inputValue
    );
  };

  const handleGuess = () => {
    if (links.indexOf(input) !== -1) {
      setGuess(input);
      setInput('');
    }
  }

  const handleEnter = e => {
    if (e.keyCode === 13) {
      handleGuess();
    }
  };

  const inputProps = {
    placeholder: 'Guess a linked article',
    value: input,
    onChange: (event, { newValue }) => setInput(newValue),
    onKeyDown: handleEnter,
    disabled: gameOver
  };

  return (
    <Container>
      <Title>LINKER</Title>
      <p>{`${start} \u2192 ${end}`}</p>
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

export default App;
