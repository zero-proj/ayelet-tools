import { Route, Routes, useNavigate } from "react-router-dom";
import { useEffect } from "react";

import VideoRating from "@/pages/video-rating";
import LolDice from "@/pages/lol-dice";

function App() {
  const redirector = useNavigate();

  useEffect(() => {
    const redirectTarget = window.sessionStorage.getItem("redirect");

    if (redirectTarget) {
      window.sessionStorage.removeItem("redirect");
      redirector(redirectTarget);
    }
  }, []);

  return (
    <Routes>
      <Route element={<VideoRating />} path="/" />
      <Route element={<VideoRating />} path="/video-rating" />
      <Route element={<LolDice />} path="/lol-dice" />
    </Routes>
  );
}

export default App;
