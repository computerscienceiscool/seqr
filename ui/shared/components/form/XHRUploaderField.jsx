/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable max-classes-per-file */

import React from 'react'
import Cookies from 'js-cookie'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { Field } from 'redux-form'
import { Message } from 'semantic-ui-react'

// XHRUploader widget: https://github.com/rma-consulting/react-xhr-uploader/blob/master/src/index.js
import XHRUploader from 'react-xhr-uploader'

const MessagePanel = styled(Message)`
  margin: 2em !important;
`

const NO_DISPLAY_STYLE = { display: 'none' }
const POINTER_CURSOR_STYLE = { cursor: 'pointer' }

const onClickInput = (event) => {
  // allows the same file to be selected more than once (see
  // https://stackoverflow.com/questions/39484895/how-to-allow-input-type-file-to-select-the-same-file-in-react-component)
  event.target.value = null // eslint-disable-line no-param-reassign
}

export class XHRUploaderWithEvents extends XHRUploader {

  static propTypes = {
    onUploadStarted: PropTypes.func,
    onUploadFinished: PropTypes.func,
    initialState: PropTypes.object,
  }

  constructor(props) {
    super(props)
    this.state = { ...this.state, ...(this.props.initialState || {}) }
  }

  setFileInputRef = (c) => { if (c) { this.fileInput = c } }

  renderInput() {
    return (
      <input
        name="file-upload"
        style={NO_DISPLAY_STYLE}
        multiple={this.props.maxFiles > 1}
        type="file"
        ref={this.setFileInputRef}
        onChange={this.onFileSelect}
        onClick={onClickInput}
      />
    )
  }

  /**
   * Override the default implementation to call the onUpload callback with the server's response and add CSRF header
   * Taken from https://github.com/harunhasdal/react-xhr-uploader/blob/master/src/index.js
   *
   * @param file
   * @param progressCallback
   */
  uploadFile(file, progressCallback) {
    if (this.props.onUploadStarted) {
      this.props.onUploadStarted()
    }

    if (file) {
      const formData = new FormData()
      const xhr = new XMLHttpRequest()

      formData.append(this.props.fieldName, file, file.name)

      xhr.onload = () => {
        progressCallback(100)
        if (this.props.onUploadFinished) {
          this.props.onUploadFinished(xhr, this.state)
        }
      }
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          progressCallback(e.loaded / e.total * 100) // eslint-disable-line no-mixed-operators
        }
      }
      xhr.open(this.props.method, this.props.url, true)
      xhr.setRequestHeader('X-CSRFToken', Cookies.get('csrf_token'))
      xhr.send(formData)
      this.xhrs[file.index] = xhr
    }
  }

  cancelFileItem = item => (e) => {
    e.stopPropagation()
    this.cancelFile(item.index)
  }

  renderFileSet() {
    const { items } = this.state
    const { progressClass } = this.props
    if (items.length > 0) {
      const { cancelIconClass, completeIconClass } = this.props
      const { styles } = this.state
      const cancelledItems = items.filter(item => item.cancelled === true)
      const filesetStyle = (items.length === cancelledItems.length) ? NO_DISPLAY_STYLE : styles.fileset
      return (
        <div style={filesetStyle}>
          {
            items.filter(item => !item.cancelled).map((item) => {
              const { file } = item
              if (!file) {
                return null
              }
              const sizeInMB = (file.size / (1024 * 1024)).toPrecision(2)
              const iconClass = item.progress < 100 ? cancelIconClass : completeIconClass
              return (
                <div key={item.index}>
                  <div style={styles.fileDetails}>
                    <span className="icon-file icon-large">&nbsp;</span>
                    <span style={styles.fileName}>{`${file.name}`}</span>
                    {sizeInMB && <span style={styles.fileSize}>{`${sizeInMB} Mb`}</span>}
                    <i className={iconClass} style={POINTER_CURSOR_STYLE} onClick={this.cancelFileItem(item)} />
                  </div>
                  <div>
                    <progress
                      style={progressClass ? undefined : styles.progress}
                      className={progressClass}
                      min="0"
                      max="100"
                      value={item.progress}
                    >
                      {`${item.progress}%`}
                    </progress>
                  </div>
                </div>
              )
            })
          }
        </div>

      )
    }

    return <div />
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (Object.keys(nextProps).some(k => nextProps[k] !== this.props[k])) {
      return true
    }
    return nextState !== this.state
  }

}

class UploaderFieldComponent extends React.PureComponent {

  static propTypes = {
    input: PropTypes.object,
    uploaderProps: PropTypes.object,
  }

  onFinished = (xhr, uploaderState) => {
    const { input } = this.props
    input.onChange({ uploaderState, ...JSON.parse(xhr.response) })
  }

  render() {
    const { input, uploaderProps } = this.props
    const { url = '/api/upload_temp_file', returnParsedData, ...uploaderComponentProps } = uploaderProps
    const path = returnParsedData ? '?parsedData=true' : ''
    return ([
      <XHRUploaderWithEvents
        key="uploader"
        onUploadFinished={this.onFinished}
        initialState={input.value ? input.value.uploaderState : null}
        url={`${url}${path}`}
        {...uploaderComponentProps}
        maxFiles={1}
      />,
      (input.value && input.value.info) ? <MessagePanel key="info" info visible list={input.value.info} /> : null,
    ])
  }

}

export const uploadedFileHasErrors = value => value && value.errors && (value.errors.length ? value.errors : undefined)
const hasUploadedFile = value => (value && value.uploadedFileId ? undefined : 'File not uploaded')
export const validateUploadedFile = value => uploadedFileHasErrors(value) || hasUploadedFile(value)
export const warnUploadedFile = value => value && value.warnings && (value.warnings.length ? value.warnings : undefined)

const UploaderFormField = React.memo(({ name, required, onChange, normalize, ...props }) => (
  <Field
    name={name}
    validate={required ? validateUploadedFile : uploadedFileHasErrors}
    warn={warnUploadedFile}
    uploaderProps={props}
    component={UploaderFieldComponent}
    onChange={onChange}
    normalize={normalize}
  />
))

UploaderFormField.propTypes = {
  name: PropTypes.string.isRequired,
  required: PropTypes.bool,
  onChange: PropTypes.func,
  normalize: PropTypes.func,
}

export default UploaderFormField
