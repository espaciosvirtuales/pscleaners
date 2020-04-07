import React from "react";
import { Route, Switch, Redirect } from "react-router-dom";

import App from "./Components/App";
// import Home from "./Components/Home";
import ListaClientes from "./Components/Clientes";
import AltaCliente from "./Components/Clientes/Alta";
import EditarCliente from "./Components/Clientes/Editar";
import ListaEmpleados from "./Components/Empleados";
import AltaEmpleado from "./Components/Empleados/Alta";
import EditarEmpleado from "./Components/Empleados/Editar";
import Reportes from "./Components/Reportes";
import Ajustes from "./Components/Ajustes";
import Login from "./Components/Login";

const AppRoutes = () => (
  <div>
    <App>
      <Switch>
        <PrivateRoute exact path="/" component={Reportes} />
        <PrivateRouteAdmin path="/clientes" component={ListaClientes} />
        <PrivateRouteAdmin path="/alta-cliente" component={AltaCliente} />
        <PrivateRouteAdmin
          path="/editar-cliente/:id"
          component={EditarCliente}
        />
        <PrivateRouteAdmin path="/empleados" component={ListaEmpleados} />
        <PrivateRouteAdmin path="/alta-empleado" component={AltaEmpleado} />
        <PrivateRouteAdmin
          path="/editar-empleado/:id"
          component={EditarEmpleado}
        />
        <PrivateRoute path="/reportes" component={Reportes} />
        <PrivateRouteAdmin path="/ajustes" component={Ajustes} />
        <PrivateRouteReverse path="/login" component={Login} />
      </Switch>
    </App>
  </div>
);

const token = JSON.parse(localStorage.getItem("token"));
// console.log(token !== null);

const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={props =>
      token !== null ? (
        <Component {...props} />
      ) : (
          <Redirect
            to={{
              pathname: "/login",
              state: { from: props.location }
            }}
          />
        )
    }
  />
);

const PrivateRouteReverse = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={props =>
      token === null ? (
        <Component {...props} />
      ) : (
          <Redirect
            to={{
              pathname: "/",
              state: { from: props.location }
            }}
          />
        )
    }
  />
);

const PrivateRouteAdmin = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={props =>
      token !== null && token.Rol === "Administrador" ? (
        <Component {...props} />
      ) : (
          <Redirect
            to={{
              pathname: "/reportes",
              state: { from: props.location }
            }}
          />
        )
    }
  />
);

export default AppRoutes;
