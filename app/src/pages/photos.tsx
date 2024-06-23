import React, { Dispatch, useEffect, useState, SetStateAction } from "react";
import { FieldValues, useForm } from "react-hook-form";
import axios from "axios";
import ProgressBar from "components/common/ProgressBar";
import styled from "styled-components";

async function login(pass: string) {
  const res = await fetch("http://192.168.1.44:3000/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ pass }),
  }).then((res) => res.json());
  if (res) {
    if (res.error) {
      console.log(res.error);
      return null;
    }
    return res.token;
  }
  return null;
}

const ProgressContainer = styled.div`
  width: 50%;
  /* left: 50%; */
  /* transform: translate(-50%, 0); */
`;

export default function Photos() {
  const { register, handleSubmit } = useForm();
  const [loggedIn, setLoggedIn] = useState(
    localStorage.getItem("authToken") !== null &&
      localStorage.getItem("authToken") !== "",
  );
  const [progress, setProgress] = useState<number | undefined>(undefined);
  console.log(loggedIn);
  async function onSubmit(data: FieldValues) {
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
          Authorization: "Bearer " + localStorage.getItem("authToken"),
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
          localStorage.setItem("authToken", "");
          setLoggedIn(false);
          console.log(loggedIn);
          return undefined;
        } else console.log(error);
      });
    if (res !== undefined) alert(JSON.stringify(`${res.data.message}`));
  }

  useEffect(() => {
    console.log("useEffect");
    let token = localStorage.getItem("authToken");
    console.log(token);
    async function tryLogin() {
      while (token === null || token === "") {
        const pass = window.prompt("Please enter password");
        if (pass === null) {
          continue;
        }
        token = await login(pass);
      }

      localStorage.setItem("authToken", token);
      setLoggedIn(true);
    }
    if (token === null || token === "") tryLogin();
  }, [loggedIn]);

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
