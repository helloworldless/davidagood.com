# David A. Good Website & Blog

https://davidagood.com

Built with [Gatsby Starter Blog](https://www.gatsbyjs.com/starters/gatsbyjs/gatsby-starter-blog).

See continuous integration pipeline here: https://github.com/helloworldless/davidagood-com-ci-pipeline.

## Helpful GraphQL Queries
```graphql
query AllFiles {
  allFile(filter: {sourceInstanceName: {eq: "blog"}}) {
    edges {
      node {
        relativePath
        publicURL
      }
    }
  }
}

query File {
  file(relativePath: {eq: "icon.png"}) {
    relativePath
    absolutePath
    sourceInstanceName
  }
}

query SiteData {
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
  ogImageDefault: file(relativePath: {eq: "icon.png"}, sourceInstanceName: {eq: "assets"}) {
    publicURL
    childImageSharp {
      
    }
  }
}

```