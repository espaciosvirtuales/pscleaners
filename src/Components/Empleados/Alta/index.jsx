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
// import SubirArchivo from "./subirArchivo";

class AltaEmpleado extends Component {
  state = {
    loading: false,
    clientesLoading: true,
    archivosUpaloded: false,
    clientes: [],
    categorias: [],
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
    archivos: [],
    nuevoEmpleado: {
      Nombre: "",
      Apellido: "",
      Sexo: "",
      Empresa: "",
      FechaCreacion: moment().format("YYYY-MM-DD")
    }
  };

  componentDidMount() {
    this.obtenerClientes();
    this.obtenerCategorias();
  }

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

  obtenerClientes = () => {
    const clientesService = feathers.service("usuarios");
    clientesService
      .find()
      .then(res => {
        // console.log(res);
        const clientes = res.data.map(o => {
          return {
            key: o.id,
            text: o.Nombre,
            value: o.id
          };
        });
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

  handleChangeSelect = (event, result) => {
    const { name, value } = result || event.target;
    this.setState({
      nuevoEmpleado: {
        ...this.state.nuevoEmpleado,
        [name]: value
      }
    });
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
      },
      () => this.recorrerObjeto()
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

  guardarArchivos = empleado_id => {
    const { archivos } = this.state;
    for (const arch in this.state.archivos) {
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
          feathers.service("archivos").create({
            Empleado_Id: empleado_id,
            Categoria_Id: archivos[arch].category_id,
            Ruta: `${process.env.REACT_APP_IP_API}/files/${
              res.data.url.split("/")[3]
              } `,
            Nombre: res.data.url.split("/")[3],
            FechaCreacion: moment().format("YYYY-MM-DD")
          });
        })
        .catch(err => console.log(err));
    }
  };

  handleSubmit = async () => {
    this.setState({ loading: true });
    await feathers
      .service("empleados")
      .create(this.state.nuevoEmpleado)
      .then(res => {
        console.log(res);
        this.guardarArchivos(res.id);
        swal(
          "Empleado Agregado",
          "El empleado se ha agregado correctamente",
          "success"
        );
        this.setState({
          nuevoEmpleado: {
            Nombre: "",
            Apellido: "",
            Sexo: "",
            Empresa: "",
            FechaCreacion: moment().format("YYYY-DD-MM")
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
            {/* <Button primary content="Registrar" onClick={this.handleSubmit} /> */}
            {/* </Form> */}
            {/* </Segment>
        <Segment loading={this.state.loading}> */}
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
                      {/* <Form> */}
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
                      {/* </Form> */}
                    </Grid.Column>
                  </Grid.Row>
                );
              })}
              <Grid.Row>
                <Grid.Column width={16} className="button-submit-cliente">
                  <Button
                    disabled={
                      this.state.nuevoEmpleado.Nombre === "" ||
                      this.state.nuevoEmpleado.Apellido === "" ||
                      this.state.nuevoEmpleado.Sexo === "" ||
                      this.state.nuevoEmpleado.Empresa === "" ||
                      this.state.archivosUpaloded === false
                    }
                    primary
                    content="Registrar"
                    onClick={this.handleSubmit}
                  />
                </Grid.Column>
              </Grid.Row>
            </Grid>
          </Form>
        </Segment>
      </div>
    );
  }
}

export default AltaEmpleado;
