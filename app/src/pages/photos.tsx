import React, { Dispatch, useEffect, useState, useCallback } from "react";
import { FieldValues, useForm } from "react-hook-form";
import axios from "axios";
import ProgressBar from "components/common/ProgressBar";
import styled from "styled-components";
import ImageGallery, { ReactImageGalleryItem } from "react-image-gallery";
import "react-image-gallery/styles/css/image-gallery.css";
import DeepEqual from "deep-equal";

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

async function getPhotos(
  loggedIn: boolean,
  setLoggedIn: Dispatch<React.SetStateAction<boolean>>,
) {
  if (!loggedIn) {
    return;
  }

  const res = await fetch("http://192.168.1.44:3000/photos", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + sessionStorage.getItem("authToken"),
    },
  })
    .then((res) => {
      if (res.status === 401) {
        throw res;
      }

      return res.json();
    })
    .catch((error) => {
      console.log("caught error");
      console.log(error);
      if (error.status === 401) {
        console.log("unauthorized, logging in");
        sessionStorage.setItem("authToken", "");
        setLoggedIn(false);
        console.log(`loggedIn: ${loggedIn}`);
        return undefined;
      } else console.log(error);
    });
  if (res) {
    if (res.error) {
      console.log(res.error);
    }
    console.log(res);
    return res;
  }
  console.log("no response");
  return null;
}

async function getPhoto(
  loggedIn: boolean,
  setLoggedIn: Dispatch<React.SetStateAction<boolean>>,
  photo: string,
) {
  if (!loggedIn) {
    return;
  }

  const res = await fetch("http://192.168.1.44:3000/photos", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + sessionStorage.getItem("authToken"),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ photo }),
  })
    .then((res) => {
      if (res.status === 401) {
        throw res;
      }

      return res.blob();
    })
    .catch((error) => {
      console.log("caught error");
      if (error.status === 401) {
        console.log("unauthorized, logging in");
        sessionStorage.setItem("authToken", "");
        setLoggedIn(false);
        console.log(`loggedIn: ${loggedIn}`);
        return undefined;
      } else console.log(error);
    });
  if (res) {
    return await res;

    // let imgData = "";

    // while (true) {
    //   const { done, value } = await res.read();
    //   if (done) {
    //     // Do something with last chunk of data then exit reader
    //     imgData += value;
    //     return imgData;
    //   }
    //   // Otherwise do something here to process current chunk
    //   imgData += value;
    // }
  }
  console.log("no response");
  return null;
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
  const [photos, setPhotos] = useState<Array<string>>([]);
  const [photoList, setPhotoList] = useState<Array<string>>([]);
  const [galleryItems, setGalleryItems] = useState<
    Array<ReactImageGalleryItem>
  >([]);

  console.log(`loggedIn: ${loggedIn}`);
  const onSubmit = useCallback(
    async function (data: FieldValues) {
      const formData = new FormData();
      if (data.file.length === 0) {
        return;
      }
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

  const getMorePhotos = useCallback(
    async function () {
      const gotPhotos = await getPhotos(loggedIn, setLoggedIn);
      if (
        gotPhotos === null ||
        gotPhotos === undefined ||
        gotPhotos.length === 0
      ) {
        return;
      }

      console.log("got");
      console.log(gotPhotos);
      console.log("current");
      console.log(photoList);

      if (DeepEqual(gotPhotos, photoList)) {
        console.log("deep equal");
        return;
      }

      console.log("got");
      console.log(gotPhotos);
      console.log("current");
      console.log(photoList);

      setPhotoList(gotPhotos);
    },
    [loggedIn, photoList],
  );

  useEffect(() => {
    if (photoList.length === 0 || photoList.length === photos.length) {
      console.log("returning");
      return;
    }

    const tmpPhotos = Array.from(photos);

    Object.keys(photoList).forEach(async (key) => {
      const gotPhoto = await getPhoto(loggedIn, setLoggedIn, photoList[key]);
      console.log(gotPhoto);
      if (gotPhoto !== null && gotPhoto !== undefined) {
        tmpPhotos.push(window.URL.createObjectURL(gotPhoto));
      }
    });
    setPhotos(() => tmpPhotos);
  }, [loggedIn, photos, photoList]);

  useEffect(() => {
    console.log("getting photos");

    getMorePhotos();
  }, [loggedIn, photos, getMorePhotos]);

  // console.log("current");
  // console.log(btoa(photo));

  console.log("photos");
  console.log(photos);
  useEffect(() => {
    console.log("updating gallery items");
    setGalleryItems(
      photos.map((photo) => {
        return { original: photo, thumbnail: photo };
      }),
    );
  }, [photos]);

  console.log("gallery items");
  console.log(galleryItems);

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
      <ImageGallery items={galleryItems} />
    </>
  );
}
