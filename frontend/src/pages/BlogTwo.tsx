import Wrapper from '../layouts/Wrapper';
import BlogTwoMain from '../components/blogs/blog-two';
import SEO from '../components/SEO';

const BlogTwo = () => {
   return (
      <Wrapper>
         <SEO pageTitle={'Edunyte Blog Two'} />
         <BlogTwoMain />
      </Wrapper>
   );
};

export default BlogTwo;