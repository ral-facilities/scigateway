import BugReportIcon from '@mui/icons-material/BugReport';
import { Box, styled, Theme } from '@mui/material';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';

const StyledLink = styled(Link)<{ component?: React.ElementType; to?: string }>(
  ({ theme }) => ({
    color: theme.palette.text.primary,
  })
);

export const PageNotFoundComponent = (): React.ReactElement => {
  const [t] = useTranslation();
  return (
    <div>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'background.default',
        }}
      >
        <BugReportIcon
          sx={{
            width: '10vw',
            height: '10vw',
            color: (theme: Theme) => theme.colours.blue,
          }}
        />
        <Typography
          sx={{
            fontWeight: 'bold',
            fontSize: '10vw',
            color: (theme: Theme) => theme.colours.blue,
          }}
        >
          404
        </Typography>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'background.default',
        }}
      >
        <Typography variant="h2" sx={{ color: 'text.primary' }}>
          {t('page-not-found.title')}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            padding: '15px',
            maxWidth: '600px',
            textAlign: 'center',
            color: 'text.secondary',
          }}
        >
          <Trans t={t} i18nKey="page-not-found.message">
            We&#39;re sorry, the page you requested was not found on the server.
            If you entered the URL manually please check your spelling and try
            again. Otherwise, return to the{' '}
            <StyledLink
              component={RouterLink}
              data-test-id="page-not-found-homepage-link"
              to="/"
            >
              homepage
            </StyledLink>{' '}
            or{' '}
            <StyledLink
              data-test-id="page-not-found-contact-support-link"
              href={t('footer.links.contact') as string}
            >
              contact support
            </StyledLink>
            .
          </Trans>
        </Typography>
      </Box>
    </div>
  );
};

export default PageNotFoundComponent;
