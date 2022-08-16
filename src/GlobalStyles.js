import styled from "styled-components";

export const Button = styled.button`
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