import styled from "styled-components";
import axios from "axios";
import Autosuggest from "react-autosuggest";
import { useCallback, useEffect, useState } from "react";
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
  gap: 0.5rem;
`;

const GuessContainer = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
`;

const parseLinks = (response) => {
  const pages = response.data.query.pages;
  let links = [];
  for (const pageCode in pages) {
    const page = pages[pageCode];
    links = [...links, ...page.links?.map(link => link.title)];
  }
  return links;
}


const renderSuggestion = suggestion => (
  <div>
    {suggestion}
  </div>
);

function App() {
  const [start, setStart] = useState("Paul Dirac");
  const [end, setEnd] = useState("Nuclear Physics");
  const [currentPlace, setCurrentPlace] = useState(start);
  const [input, setInput] = useState("");
  const [guess, setGuess] = useState(start);
  const [guesses, setGuesses] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [links, setLinks] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    console.log(guess)
    if (guess.toLowerCase() === end.toLowerCase()) {
      setGuesses(guesses => [...guesses, guess]);
      setGameOver(true)
      console.log("YOU WON");
      return;
    }
    axios.get(`https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=links&meta=&titles=${guess}&pllimit=max`).then(
    (response) => {
      const links = parseLinks(response);
      setLinks(links);
      setGuesses(guesses => [...guesses, guess]);
    });
  }, [guess]);

  const getSuggestions = value => {
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;

    return inputLength === 0 ? [] : links.filter(link =>
      link.toLowerCase().slice(0, inputLength) === inputValue
    );
  };

  const handleGuess = () => {
    if (links.indexOf(input) != -1) {
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
