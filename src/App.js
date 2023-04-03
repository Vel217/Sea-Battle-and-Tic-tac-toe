import { BrowserRouter, Route, Routes } from "react-router-dom";
import ChooseGame from "./pages/choose_game";
import Game from "./pages/sb_game";
import Login from "./pages/login";
import "./App.css";
import Header from "./pages/Header";
import TicTacGame from "./pages/ttt_game";

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
          <Route path="/tic-tac">
            <Route path=":gameId" element={<TicTacGame />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
