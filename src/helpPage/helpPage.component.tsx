import React from 'react';
import Typography from '@material-ui/core/Typography';
import {
  Theme,
  StyleRules,
  createStyles,
  WithStyles,
  withStyles,
  Link,
} from '@material-ui/core';
import { getAppStrings, getString } from '../state/strings';
import { connect } from 'react-redux';
import { AppStrings } from '../state/scigateway.types';
import { StateType } from '../state/state.types';
import { UKRITheme } from '../theming';

const styles = (theme: Theme): StyleRules =>
  createStyles({
    root: {
      padding: theme.spacing(2),
      backgroundColor: theme.palette.background.default,
      '& a': {
        '&:link': {
          color: (theme as UKRITheme).colours.link.default,
        },
        '&:visited': {
          color: (theme as UKRITheme).colours.link.visited,
        },
        '&:active': {
          color: (theme as UKRITheme).colours.link.active,
        },
      },
    },
    container: {
      display: 'flex',
      flexDirection: 'column',
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2),
      color: theme.palette.text.primary,
    },
    titleText: {
      fontWeight: 'bold',
      color: theme.palette.secondary.main,
    },
    description: {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2),
    },
  });

interface HelpPageProps {
  res: AppStrings | undefined;
}

export type CombinedHelpPageProps = HelpPageProps & WithStyles<typeof styles>;

const TableOfContents = (props: HelpPageProps): React.ReactElement => {
  const parser = new DOMParser();
  const loggingInHelp = parser.parseFromString(
    getString(props.res, 'logging-in-description'),
    'text/html'
  );
  const myDataHelp = parser.parseFromString(
    getString(props.res, 'my-data-description'),
    'text/html'
  );
  const browseHelp = parser.parseFromString(
    getString(props.res, 'browse-description'),
    'text/html'
  );
  const searchHelp = parser.parseFromString(
    getString(props.res, 'search-description'),
    'text/html'
  );
  const cartHelp = parser.parseFromString(
    getString(props.res, 'cart-description'),
    'text/html'
  );
  const downloadHelp = parser.parseFromString(
    getString(props.res, 'download-description'),
    'text/html'
  );
  const loggingInHelpLinks = loggingInHelp.querySelectorAll(
    'h1[id],h2[id],h3[id],h4[id],h5[id],h6[id]'
  );
  const myDataHelpLinks = myDataHelp.querySelectorAll(
    'h1[id],h2[id],h3[id],h4[id],h5[id],h6[id]'
  );
  const browseHelpLinks = browseHelp.querySelectorAll(
    'h1[id],h2[id],h3[id],h4[id],h5[id],h6[id]'
  );
  const searchHelpLinks = searchHelp.querySelectorAll(
    'h1[id],h2[id],h3[id],h4[id],h5[id],h6[id]'
  );
  const cartHelpLinks = cartHelp.querySelectorAll(
    'h1[id],h2[id],h3[id],h4[id],h5[id],h6[id]'
  );
  const downloadHelpLinks = downloadHelp.querySelectorAll(
    'h1[id],h2[id],h3[id],h4[id],h5[id],h6[id]'
  );
  return (
    <nav>
      <ul>
        <li>
          <Link href="#logging-in-help">
            {getString(props.res, 'logging-in-title')}
          </Link>
          {loggingInHelpLinks.length !== 0 ? (
            <ul>
              {Array.from(loggingInHelpLinks, (item, index) => (
                <li key={index}>
                  <Link href={`#${item.id}`}>{item.textContent}</Link>
                </li>
              ))}
            </ul>
          ) : null}
        </li>
        <li>
          <Link href="#my-data-help">
            {getString(props.res, 'my-data-title')}
          </Link>
          {myDataHelpLinks.length !== 0 ? (
            <ul>
              {Array.from(myDataHelpLinks, (item, index) => (
                <li key={index}>
                  <Link href={`#${item.id}`}>{item.textContent}</Link>
                </li>
              ))}
            </ul>
          ) : null}
        </li>
        <li>
          <Link href="#browse-help">
            {getString(props.res, 'browse-title')}
          </Link>
          {browseHelpLinks.length !== 0 ? (
            <ul>
              {Array.from(browseHelpLinks, (item, index) => (
                <li key={index}>
                  <Link href={`#${item.id}`}>{item.textContent}</Link>
                </li>
              ))}
            </ul>
          ) : null}
        </li>
        <li>
          <Link href="#search-help">
            {getString(props.res, 'search-title')}
          </Link>
          {searchHelpLinks.length !== 0 ? (
            <ul>
              {Array.from(searchHelpLinks, (item, index) => (
                <li key={index}>
                  <Link href={`#${item.id}`}>{item.textContent}</Link>
                </li>
              ))}
            </ul>
          ) : null}
        </li>
        <li>
          <Link href="#cart-help">{getString(props.res, 'cart-title')}</Link>
          {cartHelpLinks.length !== 0 ? (
            <ul>
              {Array.from(cartHelpLinks, (item, index) => (
                <li key={index}>
                  <Link href={`#${item.id}`}>{item.textContent}</Link>
                </li>
              ))}
            </ul>
          ) : null}
        </li>
        <li>
          <Link href="#download-help">
            {getString(props.res, 'download-title')}
          </Link>
          {downloadHelpLinks.length !== 0 ? (
            <ul>
              {Array.from(downloadHelpLinks, (item, index) => (
                <li key={index}>
                  <Link href={`#${item.id}`}>{item.textContent}</Link>
                </li>
              ))}
            </ul>
          ) : null}
        </li>
      </ul>
    </nav>
  );
};

const HelpPage = (props: CombinedHelpPageProps): React.ReactElement => {
  return (
    <div className={props.classes.root}>
      <Typography variant="h3" className={props.classes.titleText}>
        {getString(props.res, 'title')}
      </Typography>
      <TableOfContents res={props.res} />
      <div className={props.classes.container}>
        <Typography id="logging-in-help" variant="h4">
          {getString(props.res, 'logging-in-title')}
        </Typography>
        <Typography
          variant="body1"
          className={props.classes.description}
          dangerouslySetInnerHTML={{
            __html: getString(props.res, 'logging-in-description'),
          }}
        />
      </div>
      <div className={props.classes.container}>
        <Typography id="my-data-help" variant="h4">
          {getString(props.res, 'my-data-title')}
        </Typography>
        <Typography
          variant="body1"
          className={props.classes.description}
          dangerouslySetInnerHTML={{
            __html: getString(props.res, 'my-data-description'),
          }}
        />
      </div>
      <div className={props.classes.container}>
        <Typography id="browse-help" variant="h4">
          {getString(props.res, 'browse-title')}
        </Typography>
        <Typography
          variant="body1"
          className={props.classes.description}
          dangerouslySetInnerHTML={{
            __html: getString(props.res, 'browse-description'),
          }}
        />
      </div>
      <div className={props.classes.container}>
        <Typography id="search-help" variant="h4">
          {getString(props.res, 'search-title')}
        </Typography>
        <Typography
          variant="body1"
          className={props.classes.description}
          dangerouslySetInnerHTML={{
            __html: getString(props.res, 'search-description'),
          }}
        />
      </div>
      <div className={props.classes.container}>
        <Typography id="cart-help" variant="h4">
          {getString(props.res, 'cart-title')}
        </Typography>
        <Typography
          variant="body1"
          className={props.classes.description}
          dangerouslySetInnerHTML={{
            __html: getString(props.res, 'cart-description'),
          }}
        />
      </div>
      <div className={props.classes.container}>
        <Typography id="download-help" variant="h4">
          {getString(props.res, 'download-title')}
        </Typography>
        <Typography
          variant="body1"
          className={props.classes.description}
          dangerouslySetInnerHTML={{
            __html: getString(props.res, 'download-description'),
          }}
        />
      </div>
    </div>
  );
};

const mapStateToProps = (state: StateType): HelpPageProps => ({
  res: getAppStrings(state, 'help-page'),
});

export const HelpPageWithoutStyles = HelpPage;
export const HelpPageWithStyles = withStyles(styles)(HelpPage);

export default connect(mapStateToProps)(HelpPageWithStyles);
