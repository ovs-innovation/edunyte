import Wrapper from '../layouts/Wrapper';
import MyLessonsMain from '../dashboard/student-dashboard/my-lessions';
import SEO from '../components/SEO';

const MyLessions   = () => {
   return (
      <Wrapper>
         <SEO pageTitle={'Edunyte My Lessions'} />
         <MyLessonsMain />
      </Wrapper>
   );
};

export default MyLessions;