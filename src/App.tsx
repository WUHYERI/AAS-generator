import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import RootLayout from './layouts/RootLayout';
import UploadPage from './pages/UploadPage';
import EditPage from './pages/EditPage';
import ListPage from './pages/ListPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<RootLayout />}>
          <Route path="/" element={<Navigate to="/upload" replace />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/edit" element={<EditPage />} />
          <Route path="/list" element={<ListPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
