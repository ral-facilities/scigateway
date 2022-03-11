import React from 'react';
import Typography from '@mui/material/Typography';
import { Link, styled } from '@mui/material';
import { Trans, useTranslation } from 'react-i18next';

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

const TitleTypography = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  color: theme.palette.secondary.main,
}));

const DescriptionTypography = styled(Typography)<{
  component?: React.ElementType;
}>(({ theme }) => ({
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  color: theme.palette.text.primary,
}));

const AccessibiiltyPage = (): React.ReactElement => {
  const [t] = useTranslation();

  let datagatewayDomains: string[] = t('accessibility-page.domains-list', {
    returnObjects: true,
  });
  let datagatewayAccessibileParts: string[] = t(
    'accessibility-page.accessibile-parts-of-datagateway-list',
    {
      returnObjects: true,
    }
  );

  let datagatewayNonAccessibileParts: string[] = t(
    'accessibility-page.non-accessibile-parts-of-datagateway-list',
    {
      returnObjects: true,
    }
  );

  let datagatewayNonCompliance: string[] = t(
    'accessibility-page.non-compliance-with-the-accessibility-regulations-list',
    {
      returnObjects: true,
    }
  );

  let datagatewayDisproportionateBurdenTable: string[] = t(
    'accessibility-page.disproportionate-burden.table-view-list',
    {
      returnObjects: true,
    }
  );

  let datagatewayDisproportionateBurdenCard: string[] = t(
    'accessibility-page.disproportionate-burden.card-view-list',
    {
      returnObjects: true,
    }
  );

  const listPlaceholder = ['items1', 'item2', 'item3'];

  //When testing can't easily mock i18next data, but **.map will fail if
  //given a string, so replace the formats here

  if (!Array.isArray(datagatewayDomains)) datagatewayDomains = listPlaceholder;
  if (!Array.isArray(datagatewayAccessibileParts))
    datagatewayAccessibileParts = listPlaceholder;
  if (!Array.isArray(datagatewayNonAccessibileParts))
    datagatewayNonAccessibileParts = listPlaceholder;
  if (!Array.isArray(datagatewayNonCompliance))
    datagatewayNonCompliance = listPlaceholder;
  if (!Array.isArray(datagatewayDisproportionateBurdenTable))
    datagatewayDisproportionateBurdenTable = listPlaceholder;
  if (!Array.isArray(datagatewayDisproportionateBurdenCard))
    datagatewayDisproportionateBurdenCard = listPlaceholder;

  return (
    <RootDiv id="accessibility-page">
      <TitleTypography variant="h3">
        {t('accessibility-page.title')}
      </TitleTypography>

      <ContainerDiv>
        <DescriptionTypography>
          {t('accessibility-page.domains-list-text')}
        </DescriptionTypography>

        <DescriptionTypography component="ul">
          {datagatewayDomains.map((item) => (
            <li key={item}>
              <Link href={item}>{item}</Link>
            </li>
          ))}
        </DescriptionTypography>

        <DescriptionTypography>
          {t('accessibility-page.website-developed-by')}
        </DescriptionTypography>
      </ContainerDiv>

      <TitleTypography variant="h4">
        {t('accessibility-page.how-accessible-this-website-is')}
      </TitleTypography>

      <ContainerDiv>
        <DescriptionTypography>
          {t('accessibility-page.how-accessible-this-website-is-text')}
        </DescriptionTypography>
        <DescriptionTypography component="ul">
          {datagatewayAccessibileParts.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </DescriptionTypography>
      </ContainerDiv>

      <DescriptionTypography>
        <Trans
          t={t}
          i18nKey="accessibility-page.advice-on-how-to-make-device-more-accessible"
        >
          <Link
            href={t(
              'accessibility-page.advice-on-how-to-make-device-more-accessible-link'
            )}
          >
            AbilityNet
          </Link>
          has advice on making your device easier to use if you have a
          disability.
        </Trans>
      </DescriptionTypography>

      <ContainerDiv>
        <DescriptionTypography>
          {t('accessibility-page.non-accessibile-parts-of-datagateway-text')}
        </DescriptionTypography>

        <DescriptionTypography component="ul">
          {datagatewayNonAccessibileParts.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </DescriptionTypography>
      </ContainerDiv>

      <TitleTypography variant="h4">
        {t('accessibility-page.contact-us-about-accessibility')}
      </TitleTypography>

      <ContainerDiv>
        <DescriptionTypography>
          {t('accessibility-page.contact-us-about-accessibility-text')}
        </DescriptionTypography>
        {/* Here will be Comments box */}

        <DescriptionTypography>
          <Link href={`mailto:${t('accessibility-page.contact-info')}`}>
            {t('accessibility-page.contact-info')}
          </Link>
        </DescriptionTypography>
      </ContainerDiv>

      <TitleTypography variant="h4">
        {t('accessibility-page.enforcement-procedure')}
      </TitleTypography>

      <ContainerDiv>
        <DescriptionTypography>
          <Trans t={t} i18nKey="accessibility-page.enforcement-procedure-text">
            The Equality and Human Rights Commission (EHRC) is responsible for
            enforcing the Public Sector Bodies (Websites and Mobile
            Applications) (No. 2) Accessibility Regulations 2018 (the
            ‘accessibility regulations’). If you’re not happy with how we
            respond to your complaint,
            <Link href={t('accessibility-page.enforcement-procedure-link')}>
              contact the Equality Advisory and Support Service (EASS)
            </Link>
          </Trans>
        </DescriptionTypography>
      </ContainerDiv>

      <TitleTypography variant="h4">
        {t(
          'accessibility-page.technical-information-about-this-website-accessibility'
        )}
      </TitleTypography>

      <DescriptionTypography>
        {t(
          'accessibility-page.technical-information-about-this-website-accessibility-text'
        )}
      </DescriptionTypography>

      <TitleTypography variant="h4">
        {t('accessibility-page.compliance-status')}
      </TitleTypography>

      <ContainerDiv>
        <DescriptionTypography>
          <Trans t={t} i18nKey="accessibility-page.compliance-status-text">
            This website is partially compliant with the{' '}
            <Link href={t('accessibility-page.compliance-status-link')}>
              Web Content Accessibility Guidelines version 2.1
            </Link>{' '}
            AA standard, due to the non-compliances and exemptions listed below.
          </Trans>
        </DescriptionTypography>
      </ContainerDiv>
      <TitleTypography variant="h4">
        {t('accessibility-page.non-accessible-content')}
      </TitleTypography>

      <ContainerDiv>
        <DescriptionTypography>
          <em> {t('accessibility-page.non-accessible-content-text')}</em>
        </DescriptionTypography>
      </ContainerDiv>

      <TitleTypography variant="h5">
        {t(
          'accessibility-page.non-compliance-with-the-accessibility-regulations'
        )}
      </TitleTypography>

      <ContainerDiv>
        <DescriptionTypography component="ul">
          {datagatewayNonCompliance.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </DescriptionTypography>

        <Typography sx={{ paddingTop: '16px' }}>
          {t(
            'accessibility-page.non-compliance-with-the-accessibility-regulations-text'
          )}
        </Typography>
      </ContainerDiv>

      <TitleTypography variant="h5">
        {t('accessibility-page.disproportionate-burden.title')}
      </TitleTypography>

      <TitleTypography variant="h6" sx={{ paddingTop: '16px' }}>
        {t('accessibility-page.disproportionate-burden.table-view')}
      </TitleTypography>
      <ContainerDiv>
        <DescriptionTypography component="ul">
          {datagatewayDisproportionateBurdenTable.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </DescriptionTypography>
      </ContainerDiv>

      <TitleTypography variant="h6">
        {t('accessibility-page.disproportionate-burden.card-view')}
      </TitleTypography>
      <ContainerDiv>
        <DescriptionTypography component="ul">
          {datagatewayDisproportionateBurdenCard.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </DescriptionTypography>

        <DescriptionTypography>
          <Trans
            t={t}
            i18nKey="accessibility-page.disproportionate-burden.text"
          >
            We have assessed the time it would take to resolve these issues with
            table view, and card view. We believe that doing so now would be a{' '}
            <Link href={t('accessibility-page.disproportionate-burden.link')}>
              disproportionate burden{' '}
            </Link>
            within the meaning of the accessibility regulations. We will make
            another assessment before the next release, likely to be in
            September 2022.
          </Trans>
        </DescriptionTypography>
      </ContainerDiv>

      <TitleTypography variant="h5">
        {t('accessibility-page.preparation-of-this-accessibility-statement')}
      </TitleTypography>
      <ContainerDiv>
        <DescriptionTypography>
          <Trans
            t={t}
            i18nKey="accessibility-page.preparation-of-this-accessibility-statement-text"
          >
            This statement was prepared on the{' '}
            <strong>14th of February 2022</strong> It was last reviewed on the{' '}
            <strong>11th of March 2022</strong>. <br /> This website was last
            tested on <strong> 30th of November 2021 </strong>. The test was
            carried out by the{' '}
            <strong> Data &#38; Software Engineering Group. </strong>
          </Trans>
        </DescriptionTypography>
      </ContainerDiv>
    </RootDiv>
  );
};

export default AccessibiiltyPage;
