import React, { Component } from "react";
import {
  Segment,
  Header,
  Icon,
  Divider,
  Grid,
  Form,
  Table,
  Button
} from "semantic-ui-react";
import feathers from "../../feathers-client";
import { Link } from "react-router-dom";
import swal from "sweetalert";
import moment from "moment";

class Ajustes extends Component {
  state = {
    operadorNuevo: "",
    documentoNuevo: "",
    correoNuevo: "",
    correos: [],
    operadores: [],
    categorias: []
  };

  componentDidMount() {
    this.obtenerOperadores();
    this.obtenerCategorias();
    this.obtenerCorreos();
  }

  obtenerCorreos = () => {
    const correosService = feathers.service("correos");
    correosService
      .find()
      .then(res => {
        console.log(res);
        this.setState({ correos: res.data });
      })
      .catch(err => console.log(err));
  };

  obtenerOperadores = () => {
    const operadoresService = feathers.service("operadores");
    operadoresService
      .find()
      .then(res => {
        console.log(res);
        this.setState({ operadores: res.data });
      })
      .catch(err => console.log(err));
  };

  obtenerCategorias = () => {
    const categoriasService = feathers.service("categorias");
    categoriasService
      .find()
      .then(res => {
        console.log(res);
        this.setState({ categorias: res.data });
      })
      .catch(err => console.log(err));
  };

  handleChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  handleDelete = (id, catalogo) => {
    swal({
      title: "¿Seguro desea eliminar la entrada?",
      text: "Esta operación es irreversible",
      icon: "warning",
      buttons: true,
      dangerMode: true
    }).then(async willDelete => {
      if (willDelete) {
        await feathers
          .service(catalogo)
          .remove(id)
          .then(res => {
            console.log(res);
            swal("Entrada eliminada correctamente", { icon: "success" });
            this.obtenerOperadores();
            this.obtenerCategorias();
            this.obtenerCorreos();
          })
          .catch(err => {
            console.log(err);
            swal("Ocurrió un error. Intente más tarde", { icon: "error" });
          });
      }
    });
  };

  handleGuardar = async (item, catalogo) => {
    await feathers
      .service(catalogo)
      .create({
        Nombre: this.state[item],
        FechaCreacion: moment().format("YYYY-MM-DD")
      })
      .then(res => {
        console.log(res);
        this.setState({ [item]: "" });
        swal(
          "Entrada Agregada",
          "La entrada se ha agregado correctamente",
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
    this.obtenerOperadores();
    this.obtenerCategorias();
    this.obtenerCorreos();
  };

  handleEditar = (id, catalogo) => {
    swal({
      text: "Inserte el nuevo valor",
      content: "input",
      button: {
        text: "Guardar",
        closeModal: false
      }
    })
      .then(val => {
        if (!val) throw null;
        return feathers.service(catalogo).patch(id, { Nombre: val });
      })
      .then(res => {
        console.log(res);
        swal(
          "Entrada Editada",
          "La entrada se ha editado correctamente",
          "success"
        );
        this.obtenerOperadores();
        this.obtenerCategorias();
        this.obtenerCorreos();
      })
      .catch(err => {
        console.log(err);
        swal(
          "Error",
          "Ha ocurrido un error. Por favor intente mas tarde",
          "error"
        );
      });
  };

  render() {
    return (
      <div>
        <Segment>
          <Header as="h1">
            <Icon name="bell" />
            <Header.Content>Alertas</Header.Content>
          </Header>
          <Divider />
          <Grid>
            <Grid.Row columns={2}>
              <Grid.Column>
                <Form>
                  <Form.Input
                    label="Insertar Correo"
                    required
                    fluid
                    placeholder="Correo"
                    value={this.state.correoNuevo}
                    name="correoNuevo"
                    onChange={this.handleChange}
                  />
                  <Button
                    disabled={this.state.correoNuevo === ""}
                    primary
                    content="Guardar"
                    onClick={() => this.handleGuardar("correoNuevo", "correos")}
                  />
                </Form>
              </Grid.Column>
              <Grid.Column>
                <Table>
                  <Table.Header>
                    <Table.Row>
                      <Table.HeaderCell>Correo</Table.HeaderCell>
                      <Table.HeaderCell>Acciones</Table.HeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {this.state.correos.map((o, i) => {
                      return (
                        <Table.Row key={i}>
                          <Table.Cell>{o.Nombre}</Table.Cell>
                          <Table.Cell className="lista_clientes-acciones">
                            <Link
                              to="#"
                              onClick={() => this.handleDelete(o.id, "correos")}
                            >
                              <Icon name="trash" color="grey" /> Eliminar
                            </Link>
                            &nbsp;&nbsp;&nbsp;&nbsp;
                            <Link
                              to="#"
                              onClick={() => this.handleEditar(o.id, "correos")}
                            >
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

        <Segment>
          <Header as="h1">
            <Icon name="user" />
            <Header.Content>Operadores</Header.Content>
          </Header>
          <Divider />
          <Grid>
            <Grid.Row columns={2}>
              <Grid.Column>
                <Form>
                  <Form.Input
                    label="Nombre del Operador"
                    required
                    fluid
                    placeholder="Operador"
                    value={this.state.operadorNuevo}
                    name="operadorNuevo"
                    onChange={this.handleChange}
                  />
                  <Button
                    disabled={this.state.operadorNuevo === ""}
                    primary
                    content="Guardar"
                    onClick={() =>
                      this.handleGuardar("operadorNuevo", "operadores")
                    }
                  />
                </Form>
              </Grid.Column>
              <Grid.Column>
                <Table>
                  <Table.Header>
                    <Table.Row>
                      <Table.HeaderCell>Nombre del Operador</Table.HeaderCell>
                      <Table.HeaderCell>Acciones</Table.HeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {this.state.operadores.map((o, i) => {
                      return (
                        <Table.Row key={i}>
                          <Table.Cell>{o.Nombre}</Table.Cell>
                          <Table.Cell className="lista_clientes-acciones">
                            <Link
                              to="#"
                              onClick={() =>
                                this.handleDelete(o.id, "operadores")
                              }
                            >
                              <Icon name="trash" color="grey" /> Eliminar
                            </Link>
                            &nbsp;&nbsp;&nbsp;&nbsp;
                            <Link
                              to="#"
                              onClick={() =>
                                this.handleEditar(o.id, "operadores")
                              }
                            >
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

        <Segment>
          <Header as="h1">
            <Icon name="file" />
            <Header.Content>Documentos</Header.Content>
          </Header>
          <Divider />
          <Grid>
            <Grid.Row columns={2}>
              <Grid.Column>
                <Form>
                  <Form.Input
                    label="Nombre del Documento"
                    required
                    fluid
                    placeholder="Documento"
                    value={this.state.documentoNuevo}
                    name="documentoNuevo"
                    onChange={this.handleChange}
                  />
                  <Button
                    disabled={this.state.documentoNuevo === ""}
                    primary
                    content="Guardar"
                    onClick={() =>
                      this.handleGuardar("documentoNuevo", "categorias")
                    }
                  />
                </Form>
              </Grid.Column>
              <Grid.Column>
                <Table>
                  <Table.Header>
                    <Table.Row>
                      <Table.HeaderCell>Nombre del Documento</Table.HeaderCell>
                      <Table.HeaderCell>Acciones</Table.HeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {this.state.categorias.map((o, i) => {
                      return (
                        <Table.Row key={i}>
                          <Table.Cell>{o.Nombre}</Table.Cell>
                          <Table.Cell className="lista_clientes-acciones">
                            <Link
                              to="#"
                              onClick={() =>
                                this.handleDelete(o.id, "categorias")
                              }
                            >
                              <Icon name="trash" color="grey" /> Eliminar
                            </Link>
                            &nbsp;&nbsp;&nbsp;&nbsp;
                            <Link
                              to="#"
                              onClick={() =>
                                this.handleEditar(o.id, "categorias")
                              }
                            >
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
      </div>
    );
  }
}

export default Ajustes;
