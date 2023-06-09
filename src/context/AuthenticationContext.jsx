import { createContext, useEffect, useState } from "react";
import { auth } from "../Firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc
} from "firebase/firestore";
import { db } from "../Firebase";
import axios from "axios";


export const AuthenticationContext = createContext();

export const AuthenticationContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState({});
  const [uid, setUid] = useState();
  const [user, setUser] = useState();
  const [refreshToken, setRefreshToken] = useState();
  const [accessToken, setAccessToken] = useState();
  const [isInitialLoad, setIsInitialLoad] = useState(true); // Flag to track initial load
  const [expiresIn, setExpiresIn] = useState();

  const refresh = async (refreshToken, uid) => {

    axios
        .post("http://localhost:5174/refresh", {
          refreshToken: refreshToken,
        })
        .then(async (res) => {
          await updateDoc(doc(db, "accounts", uid), {
            spotifyToken: res.data.accessToken,
          });
        })
        .catch((err) => {
          console.log(err);
        });
  }

  useEffect(() => {

    const unsub = onAuthStateChanged(auth, (user) => {
      if (user !== currentUser) {
        setIsInitialLoad(true);
      } else {
        setIsInitialLoad(false);
      }
      setCurrentUser(user);
      setExpiresIn(3100);
    });

    return () => {
      unsub();
    };
  }, [user, currentUser]);

  useEffect(() => {
    if (currentUser) {
      setUid(currentUser.uid);
    }
  }, [currentUser]);

  useEffect(() => {
    if (uid) {
      const handleSearch = async () => {
        const q = query(collection(db, "accounts"), where("uid", "==", uid));

        try {
          const querySnapshot = await getDocs(q);
          querySnapshot.forEach((doc) => {
            setUser(doc.data());
          });
        } catch (err) {
          setErr(true);
        }
      };

      handleSearch();
    }
  }, [uid]);

  useEffect( () => {
    const logic = async () => {

      refresh(user.refreshToken, user.uid);

      // for friends 

      const q = query(collection(db, 'accounts'), where('uid', '!=', user.uid));
    
      try {
        const querySnapshot = await getDocs(q);
        const friends = [];
        const hold = user.friends;
        const arr = hold.map((friend) => friend.uid);
        querySnapshot.forEach((doc) => {
          const friend = doc.data();
          if (arr.includes(friend.uid)) {
            refresh(friend.refreshToken, friend.uid);
          }
        });


      } catch (err) {
        console.log(err);
      }


  }

        if (user && isInitialLoad) {
          logic();
        }

  

  }, [user, isInitialLoad]);

  useEffect(() => {

    const logic = async () => {

      refresh(user.refreshToken, user.uid);

      // for friends 

      const q = query(collection(db, 'accounts'), where('uid', '!=', user.uid));
    
      try {
        const querySnapshot = await getDocs(q);
        const friends = [];
        const hold = user.friends;
        const arr = hold.map((friend) => friend.uid);


  
        querySnapshot.forEach((doc) => {
          const friend = doc.data();
          if (arr.includes(friend.uid)) {
            refresh(friend.refreshToken, friend.uid);
          }
        });


      } catch (err) {
        console.log(err);
      }

      setExpiresIn(3100);
      window.location.reload();
    }

    if (user) { 
    const interval = setInterval(() => { 
      logic();

     }, (expiresIn - 60) * 1000)

    return () => clearInterval(interval)
  }
  }, [user, expiresIn])
  

  return (
    <AuthenticationContext.Provider value={{ currentUser }}>
      {children}
    </AuthenticationContext.Provider>
  );
};