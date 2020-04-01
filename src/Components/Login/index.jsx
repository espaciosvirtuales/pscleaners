import React, { Component } from "react";
import { Grid, Segment, Image, Form, Button } from "semantic-ui-react";
import feathers from "../../feathers-client";
import swal from "sweetalert";
import jwtDecode from "jwt-decode";
import { Redirect } from "react-router-dom";

class Login extends Component {
  state = {
    loading: false,
    usuario: "",
    contrasenia: ""
  };

  handleChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  handleLogin = () => {
    this.setState({ loading: true });
    const { usuario, contrasenia } = this.state;
    feathers
      .service("tokenapi")
      .create({
        NombreUsuario: usuario,
        Contrasenia: contrasenia
      })
      .then(res => {
        console.log(res);
        if (res.status === 403) {
          swal(
            "Error",
            "La combinación usario/contraseña no existe. Intente de nuevo.",
            "error"
          );
          this.setState({ loading: false });
        } else {
          localStorage.setItem(
            "token",
            JSON.stringify(jwtDecode(res.token)[0])
          );
          localStorage.setItem("tokenjwt", res.token);
          this.setState({ loading: false });
          window.location = "/";
        }
      })
      .catch(err => {
        console.log(err);
        swal(
          "Error",
          "Se produjo un error al realizar la operación. Intente más tarde.",
          "error"
        );
        this.setState({ loading: false });
      });
  };

  render() {
    return (
      <Grid>
        <Grid.Row centered columns={1}>
          <Grid.Column width={8}>
            <Image src="/logo.png" />
          </Grid.Column>
        </Grid.Row>
        <Grid.Row centered columns={1}>
          <Grid.Column width={8}>
            <Segment loading={this.state.loading}>
              <Form>
                <Form.Input
                  label="Usuario"
                  placeholder="Usuario"
                  fluid
                  value={this.state.usuario}
                  name="usuario"
                  onChange={this.handleChange}
                />
                <Form.Input
                  label="Contraseña"
                  placeholder="Contraseña"
                  fluid
                  type="password"
                  value={this.state.contrasenia}
                  name="contrasenia"
                  onChange={this.handleChange}
                />
                <Button
                  disabled={
                    this.state.usuario === "" || this.state.contrasenia === ""
                  }
                  primary
                  content="Ingresar"
                  onClick={this.handleLogin}
                />
              </Form>
            </Segment>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }
}

export default Login;
