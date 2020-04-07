import React, { Component } from "react";
import {
  Segment,
  Header,
  Icon,
  Divider,
  Grid,
  Form,
  Table,
  Modal,
  Button
} from "semantic-ui-react";
import feathers from "../../feathers-client";
import { Link } from "react-router-dom";
import swal from "sweetalert";
import moment from "moment";
import axios from "axios";

class Ajustes extends Component {
  state = {
    isModalOpened: false,
    operadorNuevo: "",
    documentoNuevo: "",
    correoNuevo: "",
    documentoOperadorNuevo: "",
    currentOperador: 0,
    correos: [],
    operadores: [],
    categorias: [],
    categoriasOperadores: []
  };

  componentDidMount() {
    this.obtenerCatalogos("correos");
    this.obtenerCatalogos("operadores");
    this.obtenerCatalogos("categorias");
    this.obtenerCategoriasOperadores();
  }

  obtenerCatalogos = catalogo => {
    const correosService = feathers.service(catalogo);
    correosService
      .find()
      .then(res => {
        console.log(res);
        this.setState({ [catalogo]: res.data });
      })
      .catch(err => console.log(err));
  };

  obtenerCategoriasOperadores = () => {
    const categoriasService = feathers.service("categorias-operadores");
    categoriasService
      .find()
      .then(res => {
        console.log(res);
        const archivosOperadores = {};
        res.data.forEach(o => {
          archivosOperadores[o.Nombre] = {
            file: null,
            fileName: "",
            category_id: 0
          };
        });
        this.setState({ categoriasOperadores: res.data, archivosOperadores });
      })
      .catch(err => console.log(err));
  };

  handleChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  handleDelete = (id, catalogo) => {
    swal({
      title: "¿Seguro desea eliminar la entrada?",
      text: "Esta operación es irreversible y borrará sus relaciones.",
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
            this.obtenerCatalogos("correos");
            this.obtenerCatalogos("operadores");
            this.obtenerCatalogos("categorias");
            this.obtenerCategoriasOperadores();
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
    this.obtenerCatalogos("correos");
    this.obtenerCatalogos("operadores");
    this.obtenerCatalogos("categorias");
    this.obtenerCategoriasOperadores();
  };

  closeModal = () => {
    this.setState({ isModalOpened: false, currentOperador: 0 });
    this.obtenerCategoriasOperadores();
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
        this.obtenerCatalogos("correos");
        this.obtenerCatalogos("operadores");
        this.obtenerCatalogos("categorias");
        this.obtenerCategoriasOperadores();
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

  fileChange = (e, category, category_id) => {
    const nuevoArchivo = {
      file: e.target.files[0],
      fileName: e.target.files[0].name,
      category_id
    };
    this.setState({
      archivosOperadores: {
        ...this.state.archivosOperadores,
        [e.target.name]: nuevoArchivo
      }
    });
  };

  actualizarArchivos = async () => {
    const { archivosOperadores } = this.state;
    for (const arch in archivosOperadores) {
      console.log(archivosOperadores[arch].file);
      if (archivosOperadores[arch].file !== null) {
        await feathers.service("archivos-operadores").remove(null, {
          query: {
            Operador_Id: this.state.currentOperador,
            Categoria_Id: archivosOperadores[arch].category_id
          }
        });
        const data = new FormData();
        data.append("file", archivosOperadores[arch].file);
        axios({
          method: "post",
          url: `${process.env.REACT_APP_IP_API}/uploads`,
          data: data,
          headers: { "Content-Type": "multipart/form-data" }
        })
          .then(res => {
            console.log(res);
            feathers
              .service("archivos-operadores")
              .create({
                Operador_Id: this.state.currentOperador,
                Categoria_Id: archivosOperadores[arch].category_id,
                Ruta: `${process.env.REACT_APP_IP_API}/files/${
                  res.data.url.split("/")[3]
                  } `,
                Nombre: res.data.url.split("/")[3],
                FechaCreacion: moment().format("YYYY-MM-DD")
              })
              .then(res => {
                swal(
                  "Operador Editado",
                  "El operador se ha editado correctamente",
                  "success"
                );
              })
              .catch(err => {
                swal(
                  "Error",
                  "Ha ocurrido un error. Por favor intente mas tarde",
                  "error"
                );
              });
          })
          .catch(err => console.log(err));
      }
    }
  };

  modalArchivos = () => {
    const { isModalOpened } = this.state;
    return (
      <Modal onClose={this.closeModal} open={isModalOpened} closeIcon>
        <Modal.Header>Archivos de operador</Modal.Header>
        <Modal.Content>
          <Grid>
            {this.state.categoriasOperadores.map((c, i) => {
              // console.log(i, c);
              return (
                <>
                  <Grid.Row key={i}>
                    <Grid.Column>
                      <Form>
                        <Form.Field>
                          <label>{c.Nombre}</label>
                          <div className="field-button_upload">
                            <Button
                              as="label"
                              htmlFor="file"
                              type="button"
                              animated="fade"
                              color="teal"
                              onClick={_ => {
                                document.getElementById(c.Nombre).click();
                              }}
                            >
                              <Button.Content visible>
                                <Icon name="file" />
                              </Button.Content>
                              <Button.Content hidden>
                                Seleccionar Archivo
                              </Button.Content>
                            </Button>
                          </div>
                          <div className="field-file_upload">
                            <input
                              type="file"
                              name={c.Nombre}
                              id={c.Nombre}
                              hidden
                              onChange={event =>
                                this.fileChange(event, c.Nombre, c.id)
                              }
                            />
                            <Form.Input
                              fluid
                              placeholder="No se eligió archivo"
                              readOnly
                              value={
                                this.state.archivosOperadores[c.Nombre].fileName
                              }
                            />
                          </div>
                        </Form.Field>
                      </Form>
                    </Grid.Column>
                  </Grid.Row>
                  <Divider />
                </>
              );
            })}
            <Grid.Row>
              <Grid.Column width={16}>
                <Button
                  // disabled={this.state.archivosUpaloded === false}
                  primary
                  content="Actualizar archivos"
                  onClick={this.actualizarArchivos}
                />
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Modal.Content>
      </Modal>
    );
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
                                this.setState({
                                  isModalOpened: true,
                                  currentOperador: o.id
                                })
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

        <Segment>
          <Header as="h1">
            <Icon name="file" />
            <Header.Content>Documentos de operadores</Header.Content>
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
                    value={this.state.documentoOperadorNuevo}
                    name="documentoOperadorNuevo"
                    onChange={this.handleChange}
                  />
                  <Button
                    disabled={this.state.documentoOperadorNuevo === ""}
                    primary
                    content="Guardar"
                    onClick={() =>
                      this.handleGuardar(
                        "documentoOperadorNuevo",
                        "categorias-operadores"
                      )
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
                    {this.state.categoriasOperadores.map((o, i) => {
                      return (
                        <Table.Row key={i}>
                          <Table.Cell>{o.Nombre}</Table.Cell>
                          <Table.Cell className="lista_clientes-acciones">
                            <Link
                              to="#"
                              onClick={() =>
                                this.handleDelete(o.id, "categorias-operadores")
                              }
                            >
                              <Icon name="trash" color="grey" /> Eliminar
                            </Link>
                            &nbsp;&nbsp;&nbsp;&nbsp;
                            <Link
                              to="#"
                              onClick={() =>
                                this.handleEditar(o.id, "categorias-operadores")
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
        {this.modalArchivos()}
      </div>
    );
  }
}

export default Ajustes;
