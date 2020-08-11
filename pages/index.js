import Layout from '../components/Layout';
import Link from 'next/link';
import fetch from 'isomorphic-unfetch';
import { Base64 } from 'js-base64';

const Index = props => (
  <Layout>
    <h1>Databricks Webinars</h1>
    <ul>
      { props.posts.map(post => (
        <li key={post.id}>
          <Link 
            href={{
              pathname:`p/[name]`, 
              query: { id: post.id }
            }} 
            as={`p/${post.slug}`}
          >
            <a>{post.title.rendered}</a>
          </Link>
          <p>{post.excerpt.rendered}</p>
        </li>
      ))}
    </ul>
  </Layout>
);

Index.getInitialProps = async function() {
  const login = 'databricks';
  const password = 'BigDataSimple';
  const res = await fetch('https://databricks.com/wp-json/wp/v2/webinarlist', {
    headers: {
      "Authorization": `Basic ${Base64.encode(`${login}:${password}`)}`
    },
  });
  const posts = await res.json();
  

  console.log(`posts fetched. count: ${posts.length}`);

  return { posts }
}

export default Index;