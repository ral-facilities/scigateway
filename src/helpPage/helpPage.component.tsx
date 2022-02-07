import React from 'react';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { getAppStrings, getString } from '../state/strings';
import { connect } from 'react-redux';
import { AppStrings } from '../state/scigateway.types';
import { StateType } from '../state/state.types';

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

const descriptionStyles = {
  marginTop: 2,
  marginBotton: 2,
};

interface HelpPageProps {
  res: AppStrings | undefined;
}

export type CombinedHelpPageProps = HelpPageProps;

export const HelpPage = (props: CombinedHelpPageProps): React.ReactElement => {
  return (
    <RootDiv>
      <Typography
        variant="h3"
        sx={{ fontWeight: 'bold', color: 'secondary.main' }}
      >
        {getString(props.res, 'title')}
      </Typography>
      <ContainerDiv>
        <Typography variant="h4">
          {getString(props.res, 'logging-in-title')}
        </Typography>
        <Typography
          variant="body1"
          sx={descriptionStyles}
          dangerouslySetInnerHTML={{
            __html: getString(props.res, 'logging-in-description'),
          }}
        />
      </ContainerDiv>
      <ContainerDiv>
        <Typography variant="h4">
          {getString(props.res, 'my-data-title')}
        </Typography>
        <Typography
          variant="body1"
          sx={descriptionStyles}
          dangerouslySetInnerHTML={{
            __html: getString(props.res, 'my-data-description'),
          }}
        />
      </ContainerDiv>
      <ContainerDiv>
        <Typography variant="h4">
          {getString(props.res, 'browse-title')}
        </Typography>
        <Typography
          variant="body1"
          sx={descriptionStyles}
          dangerouslySetInnerHTML={{
            __html: getString(props.res, 'browse-description'),
          }}
        />
      </ContainerDiv>
      <ContainerDiv>
        <Typography variant="h4">
          {getString(props.res, 'search-title')}
        </Typography>
        <Typography
          variant="body1"
          sx={descriptionStyles}
          dangerouslySetInnerHTML={{
            __html: getString(props.res, 'search-description'),
          }}
        />
      </ContainerDiv>
      <ContainerDiv>
        <Typography variant="h4">
          {getString(props.res, 'cart-title')}
        </Typography>
        <Typography
          variant="body1"
          sx={descriptionStyles}
          dangerouslySetInnerHTML={{
            __html: getString(props.res, 'cart-description'),
          }}
        />
      </ContainerDiv>
      <ContainerDiv>
        <Typography variant="h4">
          {getString(props.res, 'download-title')}
        </Typography>
        <Typography
          variant="body1"
          sx={descriptionStyles}
          dangerouslySetInnerHTML={{
            __html: getString(props.res, 'download-description'),
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
