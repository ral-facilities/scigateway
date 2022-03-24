import React from 'react';
import Typography from '@material-ui/core/Typography';
import {
  Theme,
  StyleRules,
  createStyles,
  WithStyles,
  withStyles,
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
    toc: {
      background: 'whitesmoke',
      border: 'solid 1px gainsboro',
      display: 'table',
      padding: '10px',
      marginTop: '10px',
    },
  });

interface HelpPageProps {
  res: AppStrings | undefined;
}

export type CombinedHelpPageProps = HelpPageProps & WithStyles<typeof styles>;

export const TableOfContents = (
  props: CombinedHelpPageProps
): React.ReactElement => {
  const parser = new DOMParser();
  const help = parser.parseFromString(
    getString(props.res, 'contents'),
    'text/html'
  );
  const helpLinks = help.querySelectorAll(
    'h1[id],h2[id],h3[id],h4[id],h5[id],h6[id]'
  );

  // highest level of h that's valid is 2 (as there should only be 1 h1 per page)
  let currLevel = 2;
  let tocHtml = '';
  for (let i = 0; i < helpLinks.length; i++) {
    const h = helpLinks[i];
    // the "h level" is the second character of the header tag i.e. h1 is hLevel 1
    const hLevel = parseInt(h.nodeName[1]);
    // lower hLevel = reduce nesting, so add closing ul tags
    if (currLevel > hLevel) {
      tocHtml += '</ul>'.repeat(currLevel - hLevel);
    }
    // higher hLevel = increase nesting, so add opening ul tags
    else if (currLevel < hLevel) {
      tocHtml += '<ul>'.repeat(hLevel - currLevel);
    }
    // we are at the same level, so just add ourselves
    tocHtml += `<li style='list-style: none'><a href='#${h.id}'>${h.textContent}</a></li>`;
    currLevel = hLevel;
  }
  // close off any remaining uls
  tocHtml += '</ul>'.repeat(currLevel - 2);

  return (
    <nav className={props.classes.toc}>
      <Typography component="h2" variant="h5">
        {getString(props.res, 'table-of-contents')}
      </Typography>
      <ul
        style={{ padding: '0px', margin: '0px' }}
        dangerouslySetInnerHTML={{ __html: tocHtml }}
      />
    </nav>
  );
};

const HelpPage = (props: CombinedHelpPageProps): React.ReactElement => {
  return (
    <div className={props.classes.root}>
      <Typography
        component="h1"
        variant="h2"
        className={props.classes.titleText}
      >
        {getString(props.res, 'title')}
      </Typography>
      <TableOfContents {...props} />
      <div className={props.classes.container}>
        <Typography
          variant="body1"
          className={props.classes.description}
          dangerouslySetInnerHTML={{
            __html: getString(props.res, 'contents'),
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
