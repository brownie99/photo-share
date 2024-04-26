import styled from "styled-components";

const MainWrapper = styled.div`
  text-align: center;
`;

export default function Home() {
  return (
    <MainWrapper>
      <div>
        <h1>Mr & Mrs Brown</h1>
        <h2>02.08.24</h2>
      </div>
    </MainWrapper>
  );
}
