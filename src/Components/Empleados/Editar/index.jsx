import React, { Component } from "react";
import {
  Segment,
  Form,
  Header,
  Icon,
  Divider,
  Button,
  Grid
} from "semantic-ui-react";
import feathers from "../../../feathers-client";
import swal from "sweetalert";
import moment from "moment";
import axios from "axios";

const token = JSON.parse(localStorage.getItem("token"));

class EditarEmpleado extends Component {
  state = {
    loading: false,
    clientesLoading: true,
    isAdmin: false,
    clientes: [],
    categorias: [],
    archivosUpaloded: false,
    sexos: [
      {
        key: 0,
        text: "Hombre",
        value: "Hombre"
      },
      {
        key: 1,
        text: "Mujer",
        value: "Mujer"
      },
      {
        key: 2,
        text: "Otro",
        value: "Otro"
      }
    ],
    nuevoEmpleado: {
      Nombre: "",
      Apellido: "",
      Sexo: "",
      Empresa: "",
      FechaCreacion: moment().format("YYYY-MM-DD")
    }
  };

  async componentDidMount() {
    if (token.Rol === "Administrador") {
      await this.setState({ isAdmin: true });
    }
    this.obtenerClientes();
    this.traerEmpleado();
    this.obtenerCategorias();
  }

  traerEmpleado = () => {
    this.setState({ loading: true });
    feathers
      .service("empleados")
      .get(this.props.match.params.id)
      .then(res => {
        console.log(res);
        this.setState({ loading: false, nuevoEmpleado: res });
      })
      .catch(err => {
        console.log(err);
      });
    this.setState({ loading: false });
  };

  obtenerClientes = () => {
    const clientesService = feathers.service("usuarios");
    clientesService
      .find()
      .then(res => {
        console.log(res);
        let clientes = res.data.map(o => {
          return {
            key: o.id,
            text: o.Nombre,
            value: o.id
          };
        });
        if (this.state.isAdmin === false) {
          clientes = clientes.filter(c => c.key == token.id);
        }
        this.setState({ clientes, clientesLoading: false });
      })
      .catch(err => console.log(err));
  };

  handleChange = (e, field) => {
    this.setState({
      nuevoEmpleado: {
        ...this.state.nuevoEmpleado,
        [field]: e.target.value
      }
    });
  };

  obtenerCategorias = () => {
    const categoriasService = feathers.service("categorias");
    categoriasService
      .find()
      .then(res => {
        console.log(res);
        const archivos = {};
        const categorias = res.data.map(o => {
          archivos[o.Nombre] = {
            file: null,
            fileName: "",
            category_id: 0
          };
          return {
            id: o.id,
            Nombre: o.Nombre,
            Estado: o.Estado
          };
        });
        this.setState({ categorias, archivos });
      })
      .catch(err => console.log(err));
  };

  fileChange = (e, category, category_id) => {
    // console.log(category);
    // console.log(e.target.name);
    const nuevoArchivo = {
      file: e.target.files[0],
      fileName: e.target.files[0].name,
      category_id
    };
    this.setState(
      {
        archivos: {
          ...this.state.archivos,
          [e.target.name]: nuevoArchivo
        }
      }/*,
      () => this.recorrerObjeto()*/
    );
  };

  recorrerObjeto = () => {
    let condicional = true;
    for (const arch in this.state.archivos) {
      console.log(this.state.archivos[arch].fileName);
      if (this.state.archivos[arch].fileName === "") condicional = false;
    }
    this.setState({ archivosUpaloded: condicional });
  };

  actualizarArchivos = async () => {
    // await feathers.service("archivos").remove(null, {
    //   query: {
    //     Empleado_Id: this.props.match.params.id
    //   }
    // });
    const { archivos } = this.state;
    for (const arch in this.state.archivos) {
      console.log(archivos[arch].file);
      if (archivos[arch].file !== null) {
        await feathers.service("archivos").remove(null, {
          query: {
            Empleado_Id: this.props.match.params.id,
            Categoria_Id: archivos[arch].category_id
          }
        });
        const data = new FormData();
        data.append("file", archivos[arch].file);
        axios({
          method: "post",
          url: `${process.env.REACT_APP_IP_API}/uploads`,
          data: data,
          headers: { "Content-Type": "multipart/form-data" }
        })
          .then(res => {
            console.log(res);
            feathers
              .service("archivos")
              .create({
                Empleado_Id: this.props.match.params.id,
                Categoria_Id: archivos[arch].category_id,
                Ruta: `${process.env.REACT_APP_IP_API}/files/${
                  res.data.url.split("/")[3]
                  } `,
                Nombre: res.data.url.split("/")[3],
                FechaCreacion: moment().format("YYYY-MM-DD")
              })
              .then(res => {
                swal(
                  "Empleado Editado",
                  "El empleado se ha editado correctamente",
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

  handleChangeSelect = (event, result) => {
    const { name, value } = result || event.target;
    this.setState({
      nuevoEmpleado: {
        ...this.state.nuevoEmpleado,
        [name]: value
      }
    });
  };

  handleSubmit = async () => {
    this.setState({ loading: true });
    let nuevoEmpleado = { ...this.state.nuevoEmpleado };
    nuevoEmpleado.FechaCreacion = moment(nuevoEmpleado.FechaCreacion).format(
      "YYYY-MM-DD"
    );
    await feathers
      .service("empleados")
      .patch(this.props.match.params.id, nuevoEmpleado)
      .then(res => {
        console.log(res);
        swal(
          "Empleado Editado",
          "El empleado se ha editado correctamente",
          "success"
        );
        this.setState({
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
      <div>
        <Segment loading={this.state.loading}>
          <Header as="h1">
            <Icon name="plus" size="large" />
            <Header.Content>Agregar empleado</Header.Content>
          </Header>
          <Divider />
          <Form>
            <Form.Group widths="equal">
              <Form.Input
                required
                fluid
                label="Nombre:"
                value={this.state.nuevoEmpleado.Nombre}
                onChange={value => this.handleChange(value, "Nombre")}
              />
              <Form.Input
                required
                fluid
                label="Apellido:"
                value={this.state.nuevoEmpleado.Apellido}
                onChange={value => this.handleChange(value, "Apellido")}
              />
            </Form.Group>
            <Form.Group widths="equal">
              <Form.Select
                required
                fluid
                label="Sexo:"
                value={this.state.nuevoEmpleado.Sexo}
                name="Sexo"
                options={this.state.sexos}
                onChange={this.handleChangeSelect}
              />
              <Form.Select
                required
                fluid
                label="Empresa:"
                value={this.state.nuevoEmpleado.Empresa}
                options={this.state.clientes}
                name="Empresa"
                onChange={this.handleChangeSelect}
              />
            </Form.Group>
            <Button
              primary
              content="Actualizar Datos"
              onClick={this.handleSubmit}
            />
          </Form>
        </Segment>
        <Segment loading={this.state.loading}>
          <Header as="h1">
            <Icon name="plus" size="large" />
            <Header.Content>Carga de Documentos</Header.Content>
          </Header>
          <Divider />
          <Grid>
            <Grid.Row>
              <Grid.Column>
                <p>
                  Sube un PDF con la información pertinente en cada uno de los
                  recuadros
                </p>
              </Grid.Column>
            </Grid.Row>
            {this.state.categorias.map((c, i) => {
              // console.log(i, c);
              return (
                <Grid.Row key={i}>
                  <Grid.Column>
                    {/* <SubirArchivo
                      position={c.id - 1}
                      archivo={c}
                      guardar={this.guardarStateDeHijo}
                    /> */}
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
                            value={this.state.archivos[c.Nombre].fileName}
                          />
                        </div>
                      </Form.Field>
                    </Form>
                  </Grid.Column>
                </Grid.Row>
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
        </Segment>
      </div>
    );
  }
}

export default EditarEmpleado;
