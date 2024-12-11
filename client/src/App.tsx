import { Route, Routes } from "react-router-dom";
import Upload from "./components/layouts/Upload";
import Dashboard from "./components/layouts/Dashboard";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />}></Route>
      <Route path="upload" element={<Upload />}></Route>
    </Routes>
  );
}

export default App;
