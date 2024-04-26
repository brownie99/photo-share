import styled from "styled-components";
import { PropsWithChildren, useState } from "react";

const Content = styled.div<{ open: boolean }>`
  @media (max-width: 420px) {
    top: 0;
    height: 100%;
    position: absolute;
    left: ${({ open }) => (open ? "0" : "-4em")};
    width: 3em;
    transition: left 0.3s ease-in-out;
    background-color: lightgray;
    display: flex;
    flex-direction: column;
    z-index: 100;
    font-size: 2em;
    padding-left: 0.5em;
    padding-right: 0.5em;
  }

  @media (min-width: 421px) {
    position: relative;
    top: 0;
    text-align: center;
    width: 100%;
    height: 1.5em;
    display: flex;
    justify-content: space-around;
    font-size: 2em;
    background-color: lightgray;
    align-items: center;
  }
`;

const Button = styled.button<{ open: boolean }>`
  @media (max-width: 420px) {
    top: 0;
    height: 2em;
    position: absolute;
    left: ${({ open }) => (open ? "8em" : "0")};
    width: 2em;
    transition: left 0.3s ease-in-out;
    background-color: lightgray;
    z-index: 100;
    text-align: center;
    display: block;
    padding: 0;
    font-size: 1em;
    font-weight: 500;
    font-family: inherit;
    background-color: #7c7c7c;
    cursor: pointer;
    border: 1px solid transparent;
  }

  @media (min-width: 421px) {
    display: none;
  }
`;

export default function SideBar({ children }: PropsWithChildren) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Content open={open}>{children}</Content>
      <Button onClick={() => setOpen((prev) => !prev)} open={open}>
        X
      </Button>
    </>
  );
}
