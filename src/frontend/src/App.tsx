import { Route, Routes } from "react-router-dom";

import VideoRating from "@/pages/video-rating";

function App() {
  return (
    <Routes>
      <Route element={<VideoRating />} path="/" />
      <Route element={<VideoRating />} path="/video-rating" />
    </Routes>
  );
}

export default App;
