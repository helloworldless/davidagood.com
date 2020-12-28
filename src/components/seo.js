/**
 * SEO component that queries for data with
 *  Gatsby's useStaticQuery React hook
 *
 * See: https://www.gatsbyjs.org/docs/use-static-query/
 */

import React from "react";
import PropTypes from "prop-types";
import { Helmet } from "react-helmet";
import { graphql, useStaticQuery } from "gatsby";
import { constructUrl } from "../utils/urlUtil";

const SEO = ({ description, lang, meta, title, imageUrl, imageAlt }) => {
  const data = useStaticQuery(
    graphql`
      query {
        site {
          siteMetadata {
            title
            description
            social {
              twitter
            }
            siteUrl
          }
        }
        ogImageDefault: file(relativePath: {eq: "icon.png"}) {
          childImageSharp {
            # These are the dimensions of the default file: content/assets/icon.png
            fixed(height: 260, width: 260) {
              src
            }
          }
        }
      }
    `,
  );

  const { siteMetadata } = data.site;
  const metaDescription = description || siteMetadata.description;
  const defaultImageUrl = constructUrl(siteMetadata.siteUrl, data.ogImageDefault?.childImageSharp?.fixed?.src)
  const ogImageUrl = imageUrl || defaultImageUrl;

  return (
    <Helmet
      htmlAttributes={{
        lang,
      }}
      title={title}
      titleTemplate={`%s | ${siteMetadata.title}`}
      meta={[
        {
          property: `description`,
          content: metaDescription,
        },
        {
          property: `og:title`,
          content: title,
        },
        {
          property: `og:description`,
          content: metaDescription,
        },
        {
          property: `og:type`,
          content: `website`,
        },
        {
          property: "og:image",
          content: ogImageUrl,
        },
        {
          property: `twitter:card`,
          // If image prop is passed use the larger card; Otherwise the default
          // og image is just a little icon so use the smaller card
          // More about cards here: https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards
          content: imageUrl ? `summary_large_image` : `summary`,
        },
        {
          property: `twitter:creator`,
          content: siteMetadata.social.twitter,
        },
        {
          property: "twitter:image:alt",
          content: imageAlt || "davidagood.com logo",
        },
      ].concat(meta)}
    />
  );
};

SEO.defaultProps = {
  lang: `en`,
  meta: [],
  description: ``,
};

SEO.propTypes = {
  description: PropTypes.string,
  lang: PropTypes.string,
  meta: PropTypes.arrayOf(PropTypes.object),
  title: PropTypes.string.isRequired,
};

export default SEO;
