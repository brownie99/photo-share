import React, {
  Dispatch,
  useEffect,
  useState,
  SetStateAction,
  useCallback,
} from "react";
import { FieldValues, useForm } from "react-hook-form";
import axios from "axios";
import ProgressBar from "components/common/ProgressBar";
import styled from "styled-components";

async function login(
  pass: string,
  setLoggingIn: React.Dispatch<React.SetStateAction<boolean>>,
) {
  setLoggingIn(() => true);
  const res = await fetch("http://192.168.1.44:3000/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ pass }),
  }).then((res) => res.json());
  setLoggingIn(() => false);
  if (res) {
    if (res.error) {
      console.log(`login error: ${res.error}`);
      return null;
    }
    console.log(`login res toekn: ${res.token}`);
    return res.token;
  }
  console.log("no response");
  return null;
}

async function getPhotos() {
  const token = sessionStorage.getItem("authToken");
  if (token === null || token === "") {
    return;
  }
}

const ProgressContainer = styled.div`
  width: 50%;
  margin: auto;
  /* left: 50%; */
  /* transform: translate(-50%, 0); */
`;

export default function Photos() {
  const { register, handleSubmit } = useForm();
  const [loggedIn, setLoggedIn] = useState(
    sessionStorage.getItem("authToken") !== null &&
      sessionStorage.getItem("authToken") !== "",
  );
  const [loggingIn, setLoggingIn] = useState(false);
  const [progress, setProgress] = useState<number | undefined>(undefined);
  console.log(`loggedIn: ${loggedIn}`);
  const onSubmit = useCallback(
    async function (data: FieldValues) {
      const formData = new FormData();
      // if (data.file.length === 0) {
      //   return;
      // }
      for (const file of data.file) {
        formData.append("file", file);
      }

      const res = await axios
        .post("http://192.168.1.44:3000/upload", formData, {
          headers: {
            Authorization: "Bearer " + sessionStorage.getItem("authToken"),
          },
          onUploadProgress: (progressEvent) => {
            const { loaded, total } = progressEvent;
            total !== undefined
              ? setProgress(Math.floor((loaded * 100) / total))
              : setProgress(undefined);
          },
        })
        .then((res) => {
          return res;
        })
        .catch((error) => {
          console.log("caught error");
          if (error.response.status === 401) {
            console.log("unauthorized, logging in");
            sessionStorage.setItem("authToken", "");
            setLoggedIn(false);
            console.log(`loggedIn: ${loggedIn}`);
            return undefined;
          } else console.log(error);
        });
      if (res !== undefined) alert(JSON.stringify(`${res.data.message}`));
    },
    [loggedIn, setProgress],
  );

  useEffect(() => {
    if (loggedIn === true || loggingIn === true) {
      return;
    }

    async function tryLogin() {
      const pass = window.prompt("Enter password");
      if (pass === null) {
        throw new Error("no password provided");
      }

      token = await login(pass, setLoggingIn);

      if (token === null) {
        throw new Error("token undefined");
      }

      sessionStorage.setItem("authToken", token);
      setLoggedIn(() => true);
    }
    let token = sessionStorage.getItem("authToken");

    tryLogin();
  }, [loggedIn, loggingIn]);

  return (
    <>
      <h1>Photos</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input type="file" {...register("file")} multiple />

        <input type="submit" />
      </form>
      {progress !== undefined ? (
        <ProgressContainer>
          <ProgressBar progress={progress} bgColor="#8742f5" />
        </ProgressContainer>
      ) : null}
    </>
  );
}
