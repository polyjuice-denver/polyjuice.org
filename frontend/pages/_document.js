import Document, {
  Head,
  Html,
  Main,
  NextScript,
} from 'next/document';

class MyDocument extends Document {
  render() {
    // noinspection HtmlRequiredTitleElement - should we add a default one?
    return (
      <Html lang="en">
        <Head>
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
            rel="stylesheet"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Poppins&display=swap"
            rel="stylesheet"
          />
          <link href='https://fonts.googleapis.com/css?family=Inter' rel='stylesheet' />
        </Head>
        <body className="font-poppins">
        <Main />
        <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
