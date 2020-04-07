import React, { Component } from "react";
import {
  Segment,
  Header,
  Icon,
  Divider,
  Grid,
  Table,
  Dropdown,
  Input,
  Select,
  Button,
  Form
} from "semantic-ui-react";
import { Link } from "react-router-dom";
import feathers from "../../feathers-client";
import DatePicker from "react-datepicker";
import moment from "moment";
import "react-datepicker/dist/react-datepicker.css";

const monthAgo = new Date();
monthAgo.setMonth(monthAgo.getMonth() - 1);

const token = JSON.parse(localStorage.getItem("token"));

class Reportes extends Component {
  state = {
    loading: false,
    isAdmin: false,
    clienteId: 0,
    empleados: [],
    clientes: [],
    operadores: [],
    FechaInicial: monthAgo,
    FechaFinal: new Date(),
    searchParams: {
      Nombre: "",
      Cliente: "",
      FechaInicial: moment()
        .subtract(1, "months")
        .format("YYYY-MM-DD"),
      FechaFinal: moment().format("YYYY-MM-DD")
    },
    class: {
      display: "none"
    }
  };

  async componentDidMount() {
    this.addClasses();
    if (token.Rol === "Administrador") {
      this.setState({ isAdmin: true, class: { display: "table-cell" } });
    } else {
      await this.setState({
        searchParams: {
          ...this.state.searchParams,
          Cliente: token.id
        }
      });
    }
    this.traerEmpleados();
    this.obtenerClientes();
    this.traerOperadores();
  }

  addClasses = () => {
    const items = document.getElementsByClassName(
      "react-datepicker__input-container"
    );
    for (let i of items) {
      i.classList.add("input");
      i.classList.add("ui");
    }
  };

  traerEmpleados = () => {
    this.setState({ loading: true });
    const empleados = feathers.service("empleados");
    const query = {
      FechaCreacion: {
        $gte: this.state.searchParams.FechaInicial,
        $lte: this.state.searchParams.FechaFinal
      }
    };
    if (this.state.searchParams.Nombre !== "") {
      query.Nombre = this.state.searchParams.Nombre;
    }
    if (this.state.searchParams.Cliente !== "") {
      query.Empresa = this.state.searchParams.Cliente;
    }
    // console.log(query);
    empleados
      .find({ query })
      .then(res => this.setState({ empleados: res.data }));
    this.setState({ loading: false });
  };

  traerOperadores = async () => {
    const operadorCliente = await feathers.service("operador-cliente").find({
      query: {
        Cliente_Id: token.id
      }
    });

    const clientesService = feathers.service("operadores");
    clientesService
      .find()
      .then(res => {
        const operadores = operadorCliente.data.map(o =>
          res.data.find(op => op.id === o.Operador_Id)
        );
        console.log(operadores);
        this.setState({ operadores });
      })
      .catch(err => console.log(err));
  };

  obtenerClientes = () => {
    const clientesService = feathers.service("usuarios");
    clientesService
      .find()
      .then(res => {
        // console.log(res);
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

  handleDeleteClick = () => {
    this.setState({
      searchParams: {
        ...this.state.searchParams,
        Nombre: ""
      }
    });
  };

  changeSearch = (event, result) => {
    const { name, value } = result || event.target;
    this.setState({
      searchParams: {
        ...this.state.searchParams,
        [name]: value
      }
    });
  };

  handleExcel = () => {
    const excel = feathers.service("export-excel");
    excel
      .find({
        query: {
          FechaInicial: this.state.searchParams.FechaInicial,
          FechaFinal: this.state.searchParams.FechaFinal,
          Nombre: this.state.searchParams.Cliente,
          Cliente: this.state.searchParams.Cliente
        }
      })
      .then(res =>
        window.open(
          `${process.env.REACT_APP_IP_API}/${res.data.split("/")[1]}`,
          "_blank"
        )
      );
  };

  changeSearchDateInicial = date => {
    console.log(moment(date).format("YYYY-MM-DD"));
    this.setState({
      FechaInicial: date,
      searchParams: {
        ...this.state.searchParams,
        FechaInicial: moment(date).format("YYYY-MM-DD")
      }
    });
  };

  changeSearchDateFinal = date => {
    this.setState({
      FechaFinal: date,
      searchParams: {
        ...this.state.searchParams,
        FechaFinal: moment(date).format("YYYY-MM-DD")
      }
    });
  };

  render() {
    return (
      <Segment loading={this.state.loading}>
        <Header as="h1">
          <Icon name="list" />
          <Header.Content>Reporte</Header.Content>
        </Header>
        <Divider />
        <Grid>
          <Grid.Row columns={4}>
            <Grid.Column>
              <Form.Field>
                <label>Empleado</label>
                <Input
                  icon={
                    <Icon name="delete" link onClick={this.handleDeleteClick} />
                  }
                  fluid
                  value={this.state.searchParams.Nombre}
                  placeholder="Nombre del Empleado"
                  name="Nombre"
                  onChange={this.changeSearch}
                />
              </Form.Field>
            </Grid.Column>
            <Grid.Column>
              <Form.Field>
                <label>Cliente</label>
                <Select
                  clearable={this.state.isAdmin}
                  placeholder="Nombre del Cliente"
                  fluid
                  value={this.state.searchParams.Cliente}
                  options={this.state.clientes}
                  name="Cliente"
                  onChange={this.changeSearch}
                />
              </Form.Field>
            </Grid.Column>
            <Grid.Column>
              <Form.Field>
                <label>Desde</label>
                <DatePicker
                  selected={this.state.FechaInicial}
                  onChange={this.changeSearchDateInicial}
                />
              </Form.Field>
            </Grid.Column>
            <Grid.Column>
              <Form.Field>
                <label>Hasta</label>
                <DatePicker
                  selected={this.state.FechaFinal}
                  onChange={this.changeSearchDateFinal}
                />
              </Form.Field>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column>
              <Button
                icon="filter"
                primary
                content="Filtrar"
                onClick={this.traerEmpleados}
              />
              <Button
                icon="file excel"
                positive
                content="Exportar"
                onClick={this.handleExcel}
              />
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column>
              <p style={{ fontWeight: "bold", fontSize: "18px" }}>
                ARCHIVOS OPERADORES:
              </p>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns={8}>
            {this.state.operadores.map((o, i) => {
              return (
                <Grid.Column key={i}>
                  <Dropdown text={o.Nombre}>
                    <Dropdown.Menu>
                      {o.archivos.map((a, i) => {
                        return (
                          <Dropdown.Item
                            key={i}
                            text={a.categoria.Nombre}
                            onClick={() => window.open(a.Ruta, "_blank")}
                          />
                        );
                      })}
                    </Dropdown.Menu>
                  </Dropdown>
                </Grid.Column>
              );
            })}
          </Grid.Row>
          <Grid.Row>
            <Grid.Column width={16}>
              <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>Nombre(s)</Table.HeaderCell>
                    <Table.HeaderCell>Apellidos</Table.HeaderCell>
                    <Table.HeaderCell>Ciudad</Table.HeaderCell>
                    <Table.HeaderCell>Cliente</Table.HeaderCell>
                    <Table.HeaderCell>Documento</Table.HeaderCell>
                    <Table.HeaderCell style={this.state.class}>
                      Acciones
                    </Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {this.state.empleados.map((c, i) => {
                    return (
                      <Table.Row key={i}>
                        <Table.Cell>{c.Nombre}</Table.Cell>
                        <Table.Cell>{c.Apellido}</Table.Cell>
                        <Table.Cell>{c.cliente.Ciudad}</Table.Cell>
                        <Table.Cell>{c.cliente.Nombre}</Table.Cell>
                        <Table.Cell>
                          <Dropdown text="Archivos">
                            <Dropdown.Menu>
                              {c.archivos.map((a, i) => {
                                return (
                                  <Dropdown.Item
                                    key={i}
                                    text={a.categoria.Nombre}
                                    onClick={() =>
                                      window.open(a.Ruta, "_blank")
                                    }
                                  />
                                );
                              })}
                            </Dropdown.Menu>
                          </Dropdown>
                        </Table.Cell>
                        <Table.Cell
                          className="lista_clientes-acciones"
                          style={this.state.class}
                        >
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

export default Reportes;
