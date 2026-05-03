import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import Dashboard from '@/pages/Dashboard';
import Recognize from '@/pages/Recognize';
import Archive from '@/pages/Archive';
import AnimalDetail from '@/pages/AnimalDetail';
import MapView from '@/pages/MapView';
import Admin from '@/pages/Admin';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'recognize', element: <Recognize /> },
      { path: 'archive', element: <Archive /> },
      { path: 'archive/:id', element: <AnimalDetail /> },
      { path: 'map', element: <MapView /> },
      { path: 'admin', element: <Admin /> },
    ],
  },
]);