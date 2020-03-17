import React, { Component } from "react";
import {
  Segment,
  Form,
  Header,
  Icon,
  Divider,
  Dropdown,
  Button
} from "semantic-ui-react";
import feathers from "../../../feathers-client";
import md5 from "md5";
import swal from "sweetalert";
import moment from "moment";

class AltaCliente extends Component {
  state = {
    loading: false,
    operadoresLoading: true,
    operadores: [],
    nuevoCliente: {
      Nombre: "",
      Sucursal: "",
      Direccion: "",
      Ciudad: "",
      Contacto: " ",
      Correo: "",
      Telefono: "",
      NombreUsuario: "",
      Contrasenia: "",
      Rol: "Cliente",
      FechaCreacion: moment().format("YYYY-DD-MM")
    }
  };

  componentDidMount() {
    this.obtenerOperadores();
  }

  obtenerOperadores = () => {
    const operadoresService = feathers.service("operadores");
    operadoresService
      .find()
      .then(res => {
        console.log(res);
        const operadores = res.data.map(o => {
          return {
            key: o.Id,
            text: o.Nombre,
            value: o.Id
          };
        });
        this.setState({ operadores, operadoresLoading: false });
      })
      .catch(err => console.log(err));
  };

  handleChange = (e, field) => {
    this.setState({
      nuevoCliente: {
        ...this.state.nuevoCliente,
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
      .create(nuevoCliente)
      .then(res => {
        console.log(res);
        swal(
          "Cliente Agregado",
          "El cliente se ha agregado correctamente",
          "success"
        );
        this.setState({
          nuevoCliente: {
            Nombre: "",
            Sucursal: "",
            Direccion: "",
            Ciudad: "",
            Contacto: "",
            Correo: "",
            Telefono: "",
            NombreUsuario: "",
            Contrasenia: "",
            Rol: ""
          },
          loading: false
        });
      })
      .catch(err => {
        console.log(err);
        swal(
          "Error",
          "Ha ocurrido un error. Por favor intente mas tarde",
          "error"
        );
        this.setState({ loading: false });
      });
  };

  render() {
    return (
      <Segment loading={this.state.loading}>
        <Header as="h1">
          <Icon name="plus" size="large" />
          <Header.Content>Agregar cliente</Header.Content>
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
            {/* <Form.Input
              required
              fluid
              label="Operadores:"
              value={this.state.nuevoCliente.Sucursal}
              onChange={value => this.handleChange(value, "Sucursal")}
            /> */}
            <Form.Field>
              <label>Operadores:</label>
              <Dropdown
                loading={this.state.operadoresLoading}
                fluid
                multiple
                selection
                options={this.state.operadores}
              />
            </Form.Field>
          </Form.Group>
          <Form.Group widths="equal">
            <Form.Input
              required
              fluid
              label="Nombre de usuario:"
              value={this.state.nuevoCliente.NombreUsuario}
              onChange={value => this.handleChange(value, "NombreUsuario")}
            />
            <Form.Input
              required
              fluid
              type="password"
              label="Contraseña:"
              value={this.state.nuevoCliente.Contrasenia}
              onChange={value => this.handleChange(value, "Contrasenia")}
            />
          </Form.Group>
          <Button primary content="Registrar" onClick={this.handleSubmit} />
        </Form>
      </Segment>
    );
  }
}

export default AltaCliente;
