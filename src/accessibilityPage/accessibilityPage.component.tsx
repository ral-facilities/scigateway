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
import { UKRITheme } from '../theming';
import { Trans, useTranslation } from 'react-i18next';
import ContactUs from './contactUs.component';

const styles = (theme: Theme): StyleRules =>
  createStyles({
    root: {
      padding: theme.spacing(2),
      backgroundColor: theme.palette.background.default,
      maxHeight: `calc(100vh - ${(theme as UKRITheme).mainAppBarHeight} - ${
        (theme as UKRITheme).footerHeight
      } - ${(theme as UKRITheme).footerPaddingTop} - ${
        (theme as UKRITheme).footerPaddingBottom
      } - ${theme.spacing(2) * 2}px)`,
      overflow: 'auto',
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
      color: theme.palette.text.primary,
    },
  });

export type CombinedAccessibiiltyPageProps = WithStyles<typeof styles>;

const AccessibiiltyPage = (
  props: CombinedAccessibiiltyPageProps
): React.ReactElement => {
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
    <div className={props.classes.root} id="accessibility-page">
      <Typography variant="h3" className={props.classes.titleText}>
        {t('accessibility-page.title')}
      </Typography>

      <div className={props.classes.container}>
        <Typography className={props.classes.description}>
          {t('accessibility-page.domains-list-text')}
        </Typography>

        <Typography component="ul" className={props.classes.description}>
          {datagatewayDomains.map((item) => (
            <li key={item}>
              <Link href={item}>{item}</Link>
            </li>
          ))}
        </Typography>

        <Typography className={props.classes.description}>
          {t('accessibility-page.website-developed-by')}
        </Typography>
      </div>

      <Typography variant="h4" className={props.classes.titleText}>
        {t('accessibility-page.how-accessible-this-website-is')}
      </Typography>

      <div className={props.classes.container}>
        <Typography className={props.classes.description}>
          {t('accessibility-page.how-accessible-this-website-is-text')}
        </Typography>
        <Typography component="ul" className={props.classes.description}>
          {datagatewayAccessibileParts.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </Typography>
      </div>

      <Typography className={props.classes.description}>
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
      </Typography>

      <div className={props.classes.container}>
        <Typography className={props.classes.description}>
          {t('accessibility-page.non-accessibile-parts-of-datagateway-text')}
        </Typography>

        <Typography component="ul" className={props.classes.description}>
          {datagatewayNonAccessibileParts.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </Typography>
      </div>

      <Typography variant="h4" className={props.classes.titleText}>
        {t('accessibility-page.contact-us-about-accessibility')}
      </Typography>

      <div className={props.classes.container}>
        <Typography className={props.classes.description}>
          {t('accessibility-page.contact-us-about-accessibility-text')}
        </Typography>

        <ContactUs />
      </div>

      <Typography variant="h4" className={props.classes.titleText}>
        {t('accessibility-page.enforcement-procedure')}
      </Typography>

      <div className={props.classes.container}>
        <Typography className={props.classes.description}>
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
        </Typography>
      </div>

      <Typography variant="h4" className={props.classes.titleText}>
        {t(
          'accessibility-page.technical-information-about-this-website-accessibility'
        )}
      </Typography>

      <Typography className={props.classes.description}>
        {t(
          'accessibility-page.technical-information-about-this-website-accessibility-text'
        )}
      </Typography>

      <Typography variant="h4" className={props.classes.titleText}>
        {t('accessibility-page.compliance-status')}
      </Typography>

      <div className={props.classes.container}>
        <Typography className={props.classes.description}>
          <Trans t={t} i18nKey="accessibility-page.compliance-status-text">
            This website is partially compliant with the{' '}
            <Link href={t('accessibility-page.compliance-status-link')}>
              Web Content Accessibility Guidelines version 2.1
            </Link>{' '}
            AA standard, due to the non-compliances and exemptions listed below.
          </Trans>
        </Typography>
      </div>
      <Typography variant="h4" className={props.classes.titleText}>
        {t('accessibility-page.non-accessible-content')}
      </Typography>

      <div className={props.classes.container}>
        <Typography className={props.classes.description}>
          <em> {t('accessibility-page.non-accessible-content-text')}</em>
        </Typography>
      </div>

      <Typography variant="h5" className={props.classes.titleText}>
        {t(
          'accessibility-page.non-compliance-with-the-accessibility-regulations'
        )}
      </Typography>

      <div className={props.classes.container}>
        <Typography component="ul" className={props.classes.description}>
          {datagatewayNonCompliance.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </Typography>

        <Typography style={{ paddingTop: 16 }}>
          {t(
            'accessibility-page.non-compliance-with-the-accessibility-regulations-text'
          )}
        </Typography>
      </div>

      <Typography variant="h5" className={props.classes.titleText}>
        {t('accessibility-page.disproportionate-burden.title')}
      </Typography>

      <Typography
        variant="h6"
        className={props.classes.titleText}
        style={{ paddingTop: 16 }}
      >
        {t('accessibility-page.disproportionate-burden.table-view')}
      </Typography>
      <div className={props.classes.container}>
        <Typography component="ul" className={props.classes.description}>
          {datagatewayDisproportionateBurdenTable.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </Typography>
      </div>

      <Typography variant="h6" className={props.classes.titleText}>
        {t('accessibility-page.disproportionate-burden.card-view')}
      </Typography>
      <div className={props.classes.container}>
        <Typography component="ul" className={props.classes.description}>
          {datagatewayDisproportionateBurdenCard.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </Typography>

        <Typography className={props.classes.description}>
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
        </Typography>
      </div>

      <Typography variant="h5" className={props.classes.titleText}>
        {t('accessibility-page.preparation-of-this-accessibility-statement')}
      </Typography>
      <div className={props.classes.container}>
        <Typography className={props.classes.description}>
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
        </Typography>{' '}
      </div>
    </div>
  );
};

export const AccessibiiltyPageWithoutStyles = AccessibiiltyPage;
export const AccessibiiltyPageWithStyles =
  withStyles(styles)(AccessibiiltyPage);

export default AccessibiiltyPageWithStyles;
