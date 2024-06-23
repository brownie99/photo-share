import styled from "styled-components";

interface ProgressBarProps {
  progress: number;
  bgColor: string;
}

const ProgressContainer = styled.div`
  height: 2em;
  width: 100%;
  background-color: #e0e0de;
  border-radius: 50;
  margin: 50;
`;

const ProgressFiller = styled.div<{ progress: number; bgColor: string }>`
  height: 2em;
  width: ${(props) => props.progress}%;
  background-color: ${(props) => props.bgColor};
  border-radius: "inherit";
  text-align: "right";
`;

const ProgressLabel = styled.span`
  padding: 5;
  color: white;
  font-weight: "bold";
`;

export default function ProgressBar({ progress, bgColor }: ProgressBarProps) {
  return (
    <ProgressContainer>
      <ProgressFiller progress={progress} bgColor={bgColor}>
        <ProgressLabel>{`${progress}`}</ProgressLabel>
      </ProgressFiller>
    </ProgressContainer>
  );
}
