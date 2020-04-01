// Dependencies
import React, { Component } from "react";
import PropTypes from "prop-types";
import { Container, Grid, Image, Dropdown, Icon } from "semantic-ui-react";
import "./App.css";
import Content from "./Global/Content";
import { Link } from "react-router-dom";

const trigger = (
  <span className="span-menu">
    <Image src="/icono-edificio.png" className="image-menu" />
    Clientes
  </span>
);

const trigger2 = (
  <span className="span-menu">
    <Image src="/icono-personal.png" className="image-menu" />
    Personal
  </span>
);

const trigger3 = (
  <span className="span-menu">
    <Image src="/icono-reporte.png" className="image-menu" />
    Reporte
  </span>
);

class App extends Component {
  static propTypes = {
    children: PropTypes.object.isRequired
  };

  state = {
    class: {
      display: "none"
    },
    userLogged: ""
  };

  componentDidMount() {
    console.log(this.props);
    const token = JSON.parse(localStorage.getItem("token"));
    console.log(token);
    if (token !== null) {
      this.setState({
        class: { display: "flex" },
        userLogged: token.Nombre
      });
    }
  }

  handleCerrarSesion = () => {
    console.log("voy a cerrar");
    localStorage.removeItem("token");
    localStorage.removeItem("tokenjwt");
    window.location = "/login";
  };

  render() {
    const { children } = this.props;

    return (
      <div className="App">
        <Container fluid>
          <Grid className="header-menu" columns={2} style={this.state.class}>
            <Grid.Row>
              <Grid.Column width={1}></Grid.Column>
              <Grid.Column width={9}>
                <Image src="/logo.png" />
              </Grid.Column>
              <Grid.Column width={3} className="userColumn">
                <Dropdown text={this.state.userLogged} className="userDropdown">
                  <Dropdown.Menu>
                    <Dropdown.Item
                      icon="power off"
                      text="Cerrar Sesion"
                      onClick={this.handleCerrarSesion}
                    />
                  </Dropdown.Menu>
                </Dropdown>
              </Grid.Column>
              <Grid.Column width={3}>
                <Link to="/ajustes">
                  <Icon name="setting" size="big" color="grey" />
                </Link>
              </Grid.Column>
            </Grid.Row>
          </Grid>
          <Grid columns={3} className="menu-principal" style={this.state.class}>
            <Grid.Row>
              <Grid.Column className="menu-item">
                {/* <Image src="/icono-edificio.png" /> */}
                <Dropdown trigger={trigger}>
                  <Dropdown.Menu>
                    <Link to="/alta-cliente">
                      <Dropdown.Item icon="plus" text="Agregar Cliente" />
                    </Link>
                    <Link to="/clientes">
                      <Dropdown.Item icon="list" text="Lista de Clientes" />
                    </Link>
                  </Dropdown.Menu>
                </Dropdown>
              </Grid.Column>
              <Grid.Column className="menu-item">
                {/* <Image src="/icono-edificio.png" /> */}
                <Dropdown trigger={trigger2}>
                  <Dropdown.Menu>
                    <Link to="/alta-empleado">
                      <Dropdown.Item icon="plus" text="Agregar Empleado" />
                    </Link>
                    <Link to="/empleados">
                      <Dropdown.Item icon="list" text="Lista de Empleados" />
                    </Link>
                  </Dropdown.Menu>
                </Dropdown>
              </Grid.Column>
              <Grid.Column className="menu-item">
                {/* <Image src="/icono-personal.png" /> */}
                <Dropdown trigger={trigger3}>
                  <Dropdown.Menu>
                    <Link to="/reportes">
                      <Dropdown.Item icon="list" text="Reportes" />
                    </Link>
                  </Dropdown.Menu>
                </Dropdown>
              </Grid.Column>
            </Grid.Row>
          </Grid>

          <Container className="main-content">
            <Content body={children} />
          </Container>
        </Container>
      </div >
    );
  }
}

export default App;
