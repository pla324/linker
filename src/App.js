import styled from "styled-components";
import axios from "axios";
import { useEffect, useState } from "react";

const Container = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
`;

const Title = styled.div`
  display: flex;
`;

const parseLinks = (response) => {
  const pages = response.data.query.pages;
  let links = [];
  for (const pageCode in pages) {
    const page = pages[pageCode];
    links = [...links, ...page.links.map(link => link.title.toLowerCase())];
  }
  return links;
}

function App() {
  const [start, setStart] = useState("Paul Dirac");
  const [end, setEnd] = useState("Nuclear Physics");
  const [currentPlace, setCurrentPlace] = useState(start);
  const [input, setInput] = useState("");
  const [guess, setGuess] = useState("");
  const [guesses, setGuesses] = useState([]);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    axios.get(`https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=links&meta=&titles=${currentPlace}&pllimit=500`).then(
    (response) => {
      const links = parseLinks(response);
      console.log(links)
      if (links.indexOf(guess) !== -1) {
        setCurrentPlace(guess);
        setGuesses(guesses => [...guesses, guess]);
        axios.get(`https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=links&meta=&titles=${guess}&pllimit=500`).then(
          (res) => {
            const linksFromGuess = parseLinks(res);
            console.log(linksFromGuess)
            if (linksFromGuess.indexOf(end.toLowerCase()) !== -1) {
              // GAME WON
              setGameOver(true);
              console.log("CONGRATS")
            }
          }
        );
      }

    });
  }, [guess]);

  return (
    <Container>
      <Title>LINKER</Title>
      <p>{start} -> {end}</p>
      <input onChange={e => setInput(e.target.value)}/>
      <button onClick={() => setGuess(input.toLowerCase())}>Guess</button>
      {guesses?.map((guess, index) => (
        <div key={index}>{guess}</div>
      ))}
    </Container>
  );
}

export default App;
