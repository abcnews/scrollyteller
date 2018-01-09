const React = require('react');

const styles = require('./index.scss');

class Panel extends React.Component {
  shouldComponentUpdate() {
    return false;
  }

  componentDidMount() {
    if (!this.base) return;
    if (!this.props.nodes) return;

    this.props.nodes.forEach(node => {
      this.base.appendChild(node);
    });

    this.props.reference(this.base);
  }

  componentWillUnmount() {
    if (!this.base) return;
    if (!this.props.nodes) return;

    this.props.nodes.forEach(node => {
      if (this.base.contains(node)) {
        this.base.removeChild(node);
      }
    });
  }

  render() {
    const { config } = this.props;
    const className =
      this.props.className ||
      [
        styles.base,
        config.light ? styles.light : null,
        config.right ? styles.right : null,
        config.left ? styles.left : null
      ]
        .filter(c => c)
        .join(' ');

    return <div ref={el => (this.base = el)} id={this.props.id} className={className} />;
  }
}

Panel.defaultProps = {
  config: {}
};

module.exports = Panel;
