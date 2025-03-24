import {Route, Routes} from 'react-router-dom';

import PrivateRoutes from './PrivateRoutes';
import {MapContainer} from './components/MapContainer'
import {Login} from './screens/Login';
import {Register} from './screens/Register';

export function Router() {
  return (
    <Routes>
      <Route
        path='/register'
        element={<Register />}
      />
      <Route
        path='/login'
        element={<Login />}
      />
      <Route
        element={<PrivateRoutes />}
      >
        <Route
          path={"/explore"}
          element={<MapContainer />}
        />
      </Route>
    </Routes>
  );
}
      // <Route element={<PrivateRoutes />}>
      //   <Route path='/logged' element={<Logged />} />
      // </Route>
      // <Route path='/' element={<LoginPage />} exact />
