import { BrowserRouter, Route, Routes } from "react-router-dom";
import ChooseGame from "./pages/choose_game";
import Game from "./pages/sb_game";
import Login from "./pages/login";
import "./App.css";
import Header from "./pages/Header";
import Ttt_game from "./pages/ttt_game"
function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/choose_game" element={<ChooseGame />} />
          <Route path="/game">
            <Route path=":gameId" element={<Game />} />
          </Route>
          <Route path="/ttt_game" element={<Ttt_game />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
