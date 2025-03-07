import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import MainPage from './pages/MainPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="*" element={
          <MainLayout>
            <MainPage />
          </MainLayout>
        } />
      </Routes>
    </Router>
  );
}

export default App;
