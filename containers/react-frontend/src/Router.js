import {Route, Routes} from 'react-router-dom';

import PrivateRoutes from './PrivateRoutes';
import {CustomMap} from './Map.js'
import {ExternalProvider} from './context/ReportsProvider'
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
          element={<CustomMap />}
        />
      </Route>
    </Routes>
  );
}
      // <Route element={<PrivateRoutes />}>
      //   <Route path='/logged' element={<Logged />} />
      // </Route>
      // <Route path='/' element={<LoginPage />} exact />
