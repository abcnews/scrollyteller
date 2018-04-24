const React = require('react');
const Panel = require('../Panel');
const assign = require('object-assign');

const styles = require('./index.scss');

class Scrollyteller extends React.Component {
  constructor(props) {
    super(props);

    this.reference = this.reference.bind(this);
    this.onScroll = this.onScroll.bind(this);

    this.references = [];

    this.state = {
      previousPanel: null,
      currentPanel: null,
      sticky: 'before'
    };
  }

  componentDidMount() {
    window.addEventListener('scroll', this.onScroll);
    this.onScroll();

    // Make sure Twitter cards aren't too wide on mobile
    setTimeout(() => {
      [].slice.call(document.querySelectorAll(`${styles.base} .twitter-tweet-rendered`)).forEach(card => {
        card.style.setProperty('width', '100%');
      });
    }, 1000);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.onScroll);
    this.references = [];
  }

  reference(panel, element) {
    this.references.push({ panel, element });
  }

  onScroll() {
    const { config, panels, onMarker } = this.props;

    if (this.references.length === 0) return;

    // Work out which panel is the current one
    const fold = window.innerHeight * (config.waypoint ? config.waypoint / 100 : 0.8);
    const referencesAboveTheFold = this.references.filter(r => {
      return r.element && r.element.getBoundingClientRect().top < fold;
    });

    let closestReference = referencesAboveTheFold[referencesAboveTheFold.length - 1];
    if (!closestReference) closestReference = this.references[0];
    if (this.state.currentPanel !== closestReference.panel) {
      this.setState(state => ({
        previousPanel: state.currentPanel,
        currentPanel: closestReference.panel
      }));
      onMarker(closestReference.panel.config);
    }

    // Fix some weird IE flickering
    clearTimeout(this.scrollTimer);
    this.setState({
      isScrolling: true
    });
    this.scrollTimer = setTimeout(() => {
      this.setState({
        isScrolling: false
      });
    }, 100);

    // Work out if the background should be fixed or not
    if (this.base) {
      const bounds = this.base.getBoundingClientRect();

      let sticky;
      if (bounds.top > 0) {
        sticky = 'before';
      } else if (bounds.bottom < window.innerHeight) {
        sticky = 'after';
      } else {
        sticky = 'during';
      }

      this.setState({ sticky });
    }
  }

  render() {
    const { config, panels, className, panelClassName, panelComponent } = this.props;

    const graphic = (
      <div
        className={`${styles.graphic} ${styles[this.state.sticky]} ${this.state.isScrolling ? styles.scrolling : ''}`}>
        {this.props.children}
      </div>
    );

    return (
      <div ref={el => (this.base = el)} className={`${styles.base} ${className}`}>
        {!config.graphicInFront && graphic}

        {panels.map(panel => {
          return React.createElement(panelComponent, {
            className: panelClassName,
            key: typeof panel.key !== 'undefined' ? panel.key : panel.id,
            config: assign({}, config, panel.config || {}),
            nodes: panel.nodes,
            reference: element => this.reference(panel, element)
          });
        })}

        {config.graphicInFront && graphic}
      </div>
    );
  }
}

Scrollyteller.defaultProps = {
  className: '',
  panelClassName: '',
  config: {},
  panels: [],
  panelComponent: Panel
};

module.exports = Scrollyteller;
