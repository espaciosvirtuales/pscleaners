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

class ListaClientes extends Component {
  state = {
    clientes: [],
    loading: false,
    loadingSearch: false,
    searchValue: ""
  };

  componentDidMount() {
    this.traerClientes();
  }

  traerClientes = nombre => {
    this.setState({ loading: true });
    const clientes = feathers.service("usuarios");
    let Nombre;
    if (nombre && nombre !== "") {
      Nombre = nombre;
    } else {
      Nombre = {
        $ne: "-1"
      };
    }
    clientes
      .find({
        query: {
          Nombre: Nombre
        }
      })
      .then(res => this.setState({ clientes: res.data }));
    this.setState({ loading: false });
  };

  handleDelete = Id => {
    swal({
      title: "¿Seguro desea eliminar el cliente?",
      text:
        "Esto eliminará a sus empleados también. Esta operación es irreversible",
      icon: "warning",
      buttons: true,
      dangerMode: true
    }).then(async willDelete => {
      if (willDelete) {
        await feathers.service("empleados").remove(null, {
          query: {
            Empresa: Id
          }
        });
        await feathers
          .service("usuarios")
          .remove(Id)
          .then(res => {
            console.log(res);
            swal("Cliente eliminado correctamente", { icon: "success" });
            this.traerClientes();
          })
          .catch(err => {
            console.log(err);
            swal("Ocurrió un error. Intente más tarde", { icon: "error" });
          });
      }
    });
  };

  handleSearch = async (e, { value }) => {
    this.setState({ searchValue: value, loadingSearch: true });
    await this.traerClientes(value);
    this.setState({ loadingSearch: false });
  };
  render() {
    return (
      <Segment loading={this.state.loading}>
        <Header as="h1">
          <Icon name="list" />
          <Header.Content>Listado de clientes</Header.Content>
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
                    <Table.HeaderCell>Sucursal</Table.HeaderCell>
                    <Table.HeaderCell>Ciudad</Table.HeaderCell>
                    <Table.HeaderCell>Correo Electronico</Table.HeaderCell>
                    <Table.HeaderCell>Telefono</Table.HeaderCell>
                    <Table.HeaderCell>Acciones</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {this.state.clientes.map((c, i) => {
                    return (
                      <Table.Row key={i}>
                        <Table.Cell>{c.Nombre}</Table.Cell>
                        <Table.Cell>{c.Sucursal}</Table.Cell>
                        <Table.Cell>{c.Ciudad}</Table.Cell>
                        <Table.Cell>{c.Correo}</Table.Cell>
                        <Table.Cell>{c.Telefono}</Table.Cell>
                        <Table.Cell className="lista_clientes-acciones">
                          <Link to="#" onClick={() => this.handleDelete(c.id)}>
                            <Icon name="trash" color="grey" /> Eliminar
                          </Link>
                          &nbsp;&nbsp;&nbsp;&nbsp;
                          <Link to={`/editar-cliente/${c.id}`}>
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

export default ListaClientes;
