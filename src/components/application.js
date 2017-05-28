const React = require('react')
const glamor = require('glamor')

const {css} = glamor

module.exports = class Application extends React.Component {
  onRef (type) {
    return (el) => {
      const {onRef} = this.props
      onRef(el, type)
    }
  }

  render () {
    const {src} = this.props
    return (
      <div>
        <canvas 
          className={css({
            position: 'fixed',
            top: 0,
            left: 0
          })} 
          ref={this.onRef('mainCanvas')}
        />
        <canvas 
          className={css({
            position: 'fixed',
            top: 0,
            left: 0
          })} 
          ref={this.onRef('processingCanvas')} 
        />
        <video 
          className={css({visibility: 'hidden'})} 
          src={src} 
          ref={this.onRef('video')} 
        />
      </div>
    )
  }
}
