import React, { Component } from "react";
import {
  Segment,
  Grid,
  Table,
  Header,
  Divider,
  Icon,
  Search
} from "semantic-ui-react";
import { Link } from "react-router-dom";
import feathers from "../../feathers-client";
import swal from "sweetalert";
import _ from "lodash";

const token = JSON.parse(localStorage.getItem("token"));

class ListaEmpleados extends Component {
  state = {
    empleados: [],
    loading: false,
    isAdmin: false,
    loadingSearch: false,
    searchValue: ""
  };

  async componentDidMount() {
    if (token.Rol === "Administrador") {
      await this.setState({ isAdmin: true });
    }
    this.traerEmpleados();
  }

  traerEmpleados = nombre => {
    this.setState({ loading: true });
    const empleados = feathers.service("empleados");
    let Nombre;
    if (nombre && nombre !== "") {
      Nombre = nombre;
    } else {
      Nombre = {
        $ne: "-1"
      };
    }
    if (this.state.isAdmin) {
      empleados
        .find({
          query: {
            $or: [{ Nombre: Nombre }, { Apellido: Nombre }]
          }
        })
        .then(res => this.setState({ empleados: res.data }));
    } else {
      empleados
        .find({
          query: {
            Empresa: token.id,
            $or: [{ Nombre: Nombre }, { Apellido: Nombre }]
          }
        })
        .then(res => this.setState({ empleados: res.data }));
    }
    this.setState({ loading: false });
  };

  handleSearch = async (e, { value }) => {
    this.setState({ searchValue: value, loadingSearch: true });
    await this.traerEmpleados(value);
    this.setState({ loadingSearch: false });
  };

  handleDelete = Id => {
    swal({
      title: "¿Seguro desea eliminar el empleado?",
      text: "Esta operación es irreversible",
      icon: "warning",
      buttons: true,
      dangerMode: true
    }).then(async willDelete => {
      if (willDelete) {
        await feathers.service("archivos").remove(null, {
          query: {
            Empleado_Id: Id
          }
        });
        await feathers
          .service("empleados")
          .remove(Id)
          .then(res => {
            console.log(res);
            swal("Empleado eliminado correctamente", { icon: "success" });
            this.traerEmpleados();
          })
          .catch(err => {
            console.log(err);
            swal("Ocurrió un error. Intente más tarde", { icon: "error" });
          });
      }
    });
  };

  render() {
    return (
      <Segment loading={this.state.loading}>
        <Header as="h1">
          <Icon name="list" />
          <Header.Content>Listado de empleados</Header.Content>
        </Header>
        <Divider />
        <Grid>
          <Grid.Row>
            <Grid.Column width={16} className="columna-buscador">
              <Search
                loading={this.state.loadingSearch}
                onSearchChange={_.debounce(this.handleSearch, 1000, {
                  leading: true
                })}
                value={this.state.searchValue}
              />
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column width={16}>
              <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>Nombre</Table.HeaderCell>
                    <Table.HeaderCell>Apellidos</Table.HeaderCell>
                    <Table.HeaderCell>Sexo</Table.HeaderCell>
                    <Table.HeaderCell>Empresa</Table.HeaderCell>
                    <Table.HeaderCell>ID Empresa</Table.HeaderCell>
                    <Table.HeaderCell>Acciones</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {this.state.empleados.map(c => {
                    return (
                      <Table.Row>
                        <Table.Cell>{c.Nombre}</Table.Cell>
                        <Table.Cell>{c.Apellido}</Table.Cell>
                        <Table.Cell>{c.Sexo}</Table.Cell>
                        <Table.Cell>{c.cliente.Nombre}</Table.Cell>
                        <Table.Cell>{c.Empresa}</Table.Cell>
                        <Table.Cell className="lista_empleados-acciones">
                          <Link to="#" onClick={() => this.handleDelete(c.id)}>
                            <Icon name="trash" color="grey" /> Eliminar
                          </Link>
                          &nbsp;&nbsp;&nbsp;&nbsp;
                          <Link to={`/editar-empleado/${c.id}`}>
                            <Icon name="pencil" color="grey" /> Editar
                          </Link>
                        </Table.Cell>
                      </Table.Row>
                    );
                  })}
                </Table.Body>
              </Table>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Segment>
    );
  }
}

export default ListaEmpleados;
