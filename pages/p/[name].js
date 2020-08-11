import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { Base64 } from 'js-base64';
import fetch from 'isomorphic-unfetch';

const Post = props => (
  <Layout>
    <h1>{props.webinar.title.rendered}</h1>
    <p>{props.webinar.content.rendered}</p>
  </Layout>
)

Post.getInitialProps = async function(context) {
  const login = 'databricks';
  const password = 'BigDataSimple';
  console.log(context);
  const { id } = context.query;
  console.log(`id:${id}`);
  const res = await fetch(`https://databricks.com/wp-json/wp/v2/webinarlist/${id}`, {
    headers: {
      "Authorization": `Basic ${Base64.encode(`${login}:${password}`)}`
    },
  });
  const webinar = await res.json();

  return { webinar };
}

export default Post;