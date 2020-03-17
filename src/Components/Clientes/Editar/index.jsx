import React, { Component } from "react";
import {
  Segment,
  Form,
  Header,
  Icon,
  Divider,
  Button
} from "semantic-ui-react";
import feathers from "../../../feathers-client";
import md5 from "md5";
import swal from "sweetalert";

class EditarCliente extends Component {
  state = {
    loading: true,
    loadingPass: false,
    nuevoCliente: {
      Nombre: "",
      Sucursal: "",
      Direccion: "",
      Ciudad: "",
      Contacto: " ",
      Correo: "",
      Telefono: "",
      NombreUsuario: ""
    },
    newPass: {
      ConfirmarContrasenia: "",
      ContraseniaNueva: ""
    }
  };

  componentDidMount() {
    this.traerCliente();
  }

  traerCliente = () => {
    this.setState({ loading: true });
    feathers
      .service("usuarios")
      .get(this.props.match.params.id)
      .then(res => {
        console.log(res);
        this.setState({ loading: false, nuevoCliente: res });
      })
      .catch(err => {
        console.log(err);
      });
    this.setState({ loading: false });
  };

  handleChange = (e, field) => {
    this.setState({
      nuevoCliente: {
        ...this.state.nuevoCliente,
        [field]: e.target.value
      }
    });
  };

  handleChangePass = (e, field) => {
    this.setState({
      newPass: {
        ...this.state.newPass,
        [field]: e.target.value
      }
    });
  };

  handleSubmit = async () => {
    this.setState({ loading: true });
    let nuevoCliente = { ...this.state.nuevoCliente };
    nuevoCliente.Contrasenia = md5(nuevoCliente.Contrasenia);
    console.log(nuevoCliente);
    await feathers
      .service("usuarios")
      .patch(this.props.match.params.id, nuevoCliente)
      .then(res => {
        console.log(res);
        swal(
          "Cliente Editado",
          "El cliente se ha editado correctamente",
          "success"
        );
      })
      .catch(err => {
        console.log(err);
        swal(
          "Error",
          "Ha ocurrido un error. Por favor intente mas tarde",
          "error"
        );
      });
    this.setState({ loading: false });
  };

  handleChangePassword = async () => {
    if (
      this.state.newPass.ContraseniaNueva !==
      this.state.newPass.ConfirmarContrasenia
    )
      return;
    this.setState({ loadingPass: true });
    await feathers
      .service("usuarios")
      .patch(this.props.match.params.id, {
        Contrasenia: md5(this.state.newPass.ContraseniaNueva)
      })
      .then(res => {
        console.log(res);
        swal(
          "Contraseña cambiada",
          "La contraseña se ha cambiado correctamente",
          "success"
        );
      })
      .catch(err => {
        console.log(err);
        swal(
          "Error",
          "Ha ocurrido un error. Por favor intente mas tarde",
          "error"
        );
      });
    this.setState({ loadingPass: false });
  };

  render() {
    return (
      <div>
        <Segment loading={this.state.loading}>
          <Header as="h1">
            <Icon name="pencil" size="large" />
            <Header.Content>Editar cliente</Header.Content>
          </Header>
          <Divider />
          <Form>
            <Form.Group widths="equal">
              <Form.Input
                required
                fluid
                label="Nombre del cliente:"
                value={this.state.nuevoCliente.Nombre}
                onChange={value => this.handleChange(value, "Nombre")}
              />
              <Form.Input
                required
                fluid
                label="Sucursal:"
                value={this.state.nuevoCliente.Sucursal}
                onChange={value => this.handleChange(value, "Sucursal")}
              />
            </Form.Group>
            <Form.Group widths="equal">
              <Form.Input
                required
                fluid
                label="Dirección:"
                value={this.state.nuevoCliente.Direccion}
                onChange={value => this.handleChange(value, "Direccion")}
              />
              <Form.Input
                required
                fluid
                label="Ciudad:"
                value={this.state.nuevoCliente.Ciudad}
                onChange={value => this.handleChange(value, "Ciudad")}
              />
            </Form.Group>
            <Form.Group widths="equal">
              <Form.Input
                required
                fluid
                label="Contacto:"
                value={this.state.nuevoCliente.Contacto}
                onChange={value => this.handleChange(value, "Contacto")}
              />
              <Form.Input
                required
                fluid
                type="email"
                label="Correo:"
                value={this.state.nuevoCliente.Correo}
                onChange={value => this.handleChange(value, "Correo")}
              />
            </Form.Group>
            <Form.Group widths="equal">
              <Form.Input
                required
                fluid
                label="Teléfono:"
                value={this.state.nuevoCliente.Telefono}
                onChange={value => this.handleChange(value, "Telefono")}
              />
              <Form.Input
                required
                fluid
                label="Operadores:"
                value={this.state.nuevoCliente.Sucursal}
                onChange={value => this.handleChange(value, "Sucursal")}
              />
            </Form.Group>
            <Form.Group widths="equal">
              <Form.Input
                required
                fluid
                label="Nombre de usuario:"
                value={this.state.nuevoCliente.NombreUsuario}
                onChange={value => this.handleChange(value, "NombreUsuario")}
              />
              {/* <Form.Input
              required
              fluid
              type="password"
              label="Contraseña:"
              value={this.state.nuevoCliente.Contrasenia}
              onChange={value => this.handleChange(value, "Contrasenia")}
            /> */}
            </Form.Group>
            <Button primary content="Guardar" onClick={this.handleSubmit} />
          </Form>
        </Segment>

        <Segment loading={this.state.loadingPass}>
          <Header as="h1">
            <Icon name="pencil" size="large" />
            <Header.Content>Cambiar contraseña</Header.Content>
          </Header>
          <Divider />
          <Form>
            <Form.Group widths="equal">
              <Form.Input
                required
                fluid
                type="password"
                label="Nueva contraseña:"
                value={this.state.nuevoCliente.ContraseniaNueva}
                onChange={value =>
                  this.handleChangePass(value, "ContraseniaNueva")
                }
              />
              <Form.Input
                required
                fluid
                type="password"
                label="Confirmar contraseña:"
                value={this.state.nuevoCliente.ConfirmarContrasenia}
                onChange={value =>
                  this.handleChangePass(value, "ConfirmarContrasenia")
                }
              />
            </Form.Group>
            <Button
              primary
              content="Actualizar Contraseña"
              onClick={this.handleChangePassword}
            />
          </Form>
        </Segment>
      </div>
    );
  }
}

export default EditarCliente;
