import React, { Component } from "react";
import { Form, Button, Icon } from "semantic-ui-react";

class SubirArchivo extends Component {
  state = {
    file: null,
    fileName: ""
  };

  componentDidMount() {
    // console.log(this.props);
  }

  fileChange = e => {
    console.log(this.props.position);
    this.props.guardar(this.props.position, e.target.files[0]);
  };

  render() {
    return (
      <Form>
        <Form.Field>
          <label>{this.props.archivo.Nombre}</label>
          <div className="field-button_upload">
            <Button
              as="label"
              htmlFor="file"
              type="button"
              animated="fade"
              color="teal"
            >
              <Button.Content visible>
                <Icon name="file" />
              </Button.Content>
              <Button.Content hidden>Seleccionar Archivo</Button.Content>
            </Button>
          </div>
          <div className="field-file_upload">
            <input type="file" id="file" hidden onChange={this.fileChange} />
            <Form.Input
              fluid
              placeholder="No se eligió archivo"
              readOnly
              value={this.props.archivo.file.fileName}
            />
          </div>
        </Form.Field>
      </Form>
    );
  }
}

export default SubirArchivo;
