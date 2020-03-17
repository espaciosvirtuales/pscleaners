// Dependencies
import React, { Component } from "react";
import PropTypes from "prop-types";
import { Container, Grid, Image, Dropdown } from "semantic-ui-react";
import "./App.css";
import Content from "./Global/Content";
import { Link } from "react-router-dom";

const trigger = (
  <span>
    <Image src="/icono-edificio.png" />
  </span>
);

class App extends Component {
  static propTypes = {
    children: PropTypes.object.isRequired
  };

  render() {
    const { children } = this.props;

    return (
      <div className="App">
        <Container fluid>
          <Grid className="header-menu" columns={2}>
            <Grid.Row>
              <Grid.Column width={1}></Grid.Column>
              <Grid.Column width={10}>
                <Image src="/logo.png" />
              </Grid.Column>
              <Grid.Column width={4}>
                <p>Aqui ira el usuario</p>
              </Grid.Column>
            </Grid.Row>
          </Grid>
          <Grid columns={3} className="menu-principal">
            <Grid.Row>
              <Grid.Column className="menu-item">
                {/* <Image src="/icono-edificio.png" /> */}
                <Dropdown trigger={trigger}>
                  <Dropdown.Menu>
                    <Link to="/alta-cliente">
                      <Dropdown.Item icon="plus" text="Agregar" />
                    </Link>
                    <Link to="/clientes">
                      <Dropdown.Item icon="list" text="Lista de Clientes" />
                    </Link>
                  </Dropdown.Menu>
                </Dropdown>
              </Grid.Column>
              <Grid.Column className="menu-item">
                <Image src="/icono-personal.png" />
              </Grid.Column>
              <Grid.Column className="menu-item">
                <Image src="/icono-personal.png" />
              </Grid.Column>
            </Grid.Row>
          </Grid>

          <Container className="main-content">
            <Content body={children} />
          </Container>
        </Container>
      </div>
    );
  }
}

export default App;
