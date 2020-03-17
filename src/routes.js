import React from "react";
import { Route, Switch } from "react-router-dom";

import App from "./Components/App";
import Home from "./Components/Home";
import ListaClientes from "./Components/Clientes";
import AltaCliente from "./Components/Clientes/Alta";
import EditarCliente from "./Components/Clientes/Editar";

const AppRoutes = () => (
  <App>
    <Switch>
      <Route exact path="/" component={Home} />
      <Route path="/clientes" component={ListaClientes} />
      <Route path="/alta-cliente" component={AltaCliente} />
      <Route path="/editar-cliente/:id" component={EditarCliente} />
    </Switch>
  </App>
);

export default AppRoutes;
