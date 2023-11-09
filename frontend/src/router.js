import CreateRequest from './pages/CreateRequest/CreateRequest'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Hotels from './pages/Hotels/Hotels'
import RequestsHistory from './pages/RequestsHistory/RequestsHistory'
import Settings from './pages/Settings/Settings'

export const routes = {
    home: {
        path: '/',
        element: <Hotels />
    },
    createRequest: {
        path: '/request',
        element: <CreateRequest />
    },
    history: {
        path: '/history',
        element: <RequestsHistory />
    },
    request: {
        path: '/history/:id',
        link: '/history/',
        element: <Hotels />
    },
    settings: {
        path: '/settings',
        element: <Settings />
    }
}

export const getRoutes = () => {
    return (
        <Routes>
            {
                Object.keys(routes).map((route) => {
                    return (
                        <Route key={routes[route].path} path={routes[route].path} element={routes[route].element} />
                    )
                })
            }
        </Routes>
    )
}