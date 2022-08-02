import React from 'react';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { getAppStrings, getString } from '../state/strings';
import { connect } from 'react-redux';
import { AppStrings } from '../state/scigateway.types';
import { StateType } from '../state/state.types';
import useAnchor from '../hooks/useAnchor';

const RootDiv = styled('div')(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.default,
  '& a': {
    '&:link': {
      color: theme.colours.link.default,
    },
    '&:visited': {
      color: theme.colours.link.visited,
    },
    '&:active': {
      color: theme.colours.link.active,
    },
  },
}));

const ContainerDiv = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  color: theme.palette.text.primary,
}));

const DescriptionTypography = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

const TableOfContentsNav = styled('nav')(({ theme }) => ({
  color: theme.palette.text.primary,
  backgroundColor: theme.palette.background.paper,
  border: `solid 1px ${theme.palette.divider}`,
  display: 'table',
  padding: '10px',
  marginTop: '10px',
}));

interface HelpPageProps {
  res: AppStrings | undefined;
}

export type CombinedHelpPageProps = HelpPageProps;

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
    <TableOfContentsNav>
      <Typography variant="h5">
        {getString(props.res, 'table-of-contents')}
      </Typography>
      <ul
        style={{ padding: '0px', margin: '0px' }}
        dangerouslySetInnerHTML={{ __html: tocHtml }}
      />
    </TableOfContentsNav>
  );
};

const HelpPage = (props: CombinedHelpPageProps): React.ReactElement => {
  const topOfPageIcon = getString(props.res, 'top-of-page-icon');
  const parser = new DOMParser();
  const helpTextHtml = parser.parseFromString(
    getString(props.res, 'contents'),
    'text/html'
  );
  helpTextHtml
    .querySelectorAll('h1[id],h2[id],h3[id],h4[id],h5[id],h6[id]')
    .forEach((el) => {
      el.insertAdjacentHTML('afterbegin', topOfPageIcon);
    });

  useAnchor();

  return (
    <RootDiv>
      <Typography
        variant="h3"
        sx={{ fontWeight: 'bold', color: 'secondary.main' }}
      >
        {getString(props.res, 'title')}
      </Typography>
      <TableOfContents {...props} />
      <ContainerDiv>
        <DescriptionTypography
          variant="body1"
          dangerouslySetInnerHTML={{
            __html: helpTextHtml.body.innerHTML,
          }}
        />
      </ContainerDiv>
    </RootDiv>
  );
};

const mapStateToProps = (state: StateType): HelpPageProps => ({
  res: getAppStrings(state, 'help-page'),
});

export const UnconnectedHelpPage = HelpPage;

export default connect(mapStateToProps)(HelpPage);
